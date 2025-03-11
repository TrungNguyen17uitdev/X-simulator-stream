import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';
import { TweetDataDoc } from './tweet/models';
import { TweetService } from './tweet/tweet.service';

@WebSocketGateway({ transports: ['websocket'] })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly subscriptionMap = new Map<string, Subscription>();
  private subscription: Subscription;

  constructor(
    private readonly appService: AppService,
    private readonly tweetService: TweetService,
  ) {}

  @WebSocketServer()
  private server: Server;

  @SubscribeMessage('subscribe')
  async handleInitStream(@MessageBody() data: string[], @ConnectedSocket() client: Socket) {
    await this.appService.getData(data);
    this.initSubscription(client);
    return 'Subscribed';
  }

  @SubscribeMessage('unsubscribe')
  handleStopStream(client: Socket) {
    this.unsubscribe(client);
    return 'Unsubscribed';
  }

  @SubscribeMessage('create-tweets')
  async handleCreateTweet(@MessageBody() data: TweetDataDoc[], @ConnectedSocket() socket: Socket) {
    const tweets = await this.tweetService.getTweetsById(
      data.map(d => d._id),
      this.appService.$rules.value,
    );
    this.server.emit('tweetData', tweets);
  }

  handleConnection(client: Socket): void {
    this.initSubscription(client);
  }

  handleDisconnect(client: Socket): void {
    this.unsubscribe(client);
  }

  private initSubscription(client: Socket) {
    if (this.subscriptionMap.get(client.client.id) == null) {
      this.subscriptionMap.set(
        client.client.id,
        this.appService.tweets$.subscribe((data: any[]) => {
          this.server.emit('tweetData', data);
        }),
      );

      if (!this.appService.subscription) {
        this.appService.subscription = this.appService.rules$.subscribe(async rules => {
          await this.appService.getData(rules);
        });
      }
    }
  }

  private unsubscribe(client: Socket) {
    this.subscriptionMap.get(client.client.id)?.unsubscribe();
    this.subscriptionMap.set(client.client.id, null);
    if ([...this.subscriptionMap.values()].every(sub => sub == null)) {
      this.appService.stop();
    }
  }
}
