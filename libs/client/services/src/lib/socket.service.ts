import { Injectable } from '@angular/core';
import { TweetFilteredStream } from '@app/client/common';
import { fromEventPattern, Observable } from 'rxjs';
import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;

export interface SocketEventMap {
  tweetData: TweetFilteredStream[];
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.socket = io('http://localhost:3333', { transports: ['websocket'] });
    } catch (e) {
      console.log('Error initialize handshake with WS', e);
    }
  }

  on<K extends keyof SocketEventMap>(event: K): Observable<SocketEventMap[K]> {
    return fromEventPattern(
      handler => {
        this.socket?.on(event, handler);
      },
      handler => {
        this.socket?.off(event, handler);
      },
    );
  }

  emit(event: string, ...args: any[]): void {
    this.socket?.emit(event, ...args);
  }
}
