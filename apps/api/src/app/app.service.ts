import { HttpService, Injectable } from '@nestjs/common';
import { BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { TweetDataDto } from './tweet/tweet.dto';
import { TweetService } from './tweet/tweet.service';

@Injectable()
export class AppService {
  subscription: Subscription;
  private readonly $tweets = new ReplaySubject(1);
  readonly $rules = new BehaviorSubject<string[]>([
    '67b5e8a2c6bd6f4f28ff6723',
    '67b5e8a2c6bd6f4f28ff6724',
    '67b5e8a2c6bd6f4f28ff6725',
  ]);
  tweets$ = this.$tweets.asObservable();
  rules$ = this.$rules.asObservable();

  constructor(
    private readonly http: HttpService,
    private readonly twService: TweetService, // private readonly appGateway: AppGateway,
  ) {}

  getRules() {
    return this.twService.getRule();
  }

  addRules(rules: string[]) {
    this.$rules.next(rules);
    return this.twService.getRulesById(rules);
  }

  deleteRules(rules: string[]) {
    const _rules = this.$rules.value.filter(rule => rules.includes(rule));
    this.$rules.next(_rules);
    return _rules;
  }

  async getData(rules: string[] = []) {
    const tweets = await this.twService.getTweet(rules);
    this.$tweets.next(tweets);
  }

  addTweets(tweets: TweetDataDto[]) {
    if (this.subscription) {
      this.$tweets.next(tweets);
    }
  }

  stop() {
    console.log('stopping');
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}
