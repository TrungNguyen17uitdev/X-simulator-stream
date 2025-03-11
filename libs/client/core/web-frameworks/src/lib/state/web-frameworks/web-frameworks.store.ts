import { Injectable } from '@angular/core';
import { TweetFilteredStream } from '@app/client/common';
import { Store, StoreConfig } from '@datorama/akita';

export interface WebFrameworksState extends Record<string, string[] | number> {
  subscribedAt: number;
}

export function createInitialState(): WebFrameworksState {
  return {
    subscribedAt: 0,
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'web-frameworks', resettable: true })
export class WebFrameworksStore extends Store<WebFrameworksState> {
  constructor() {
    super(createInitialState());
  }

  updateFromTweet(tweets: TweetFilteredStream[]): void {
    console.log('WebFrameworksStore', tweets);

    this.update(state => {
      const updatedState = { ...state };

      tweets.forEach(tweet => {
        const { matching_rules } = tweet;
        for (const rule of matching_rules) {
          if (!updatedState[rule.tag]) {
            (updatedState[rule.tag] as string[]) = [];
          }

          if (!(updatedState[rule.tag] as string[]).includes(tweet._id)) {
            (updatedState[rule.tag] as string[]).push(tweet._id);
          }
        }
      });

      console.log('WebFrameworksStore', updatedState);
      return updatedState;
    });
  }
}
