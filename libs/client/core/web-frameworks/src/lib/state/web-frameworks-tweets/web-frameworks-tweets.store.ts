import { Injectable } from '@angular/core';
import { TweetData, TweetFilteredStream, TweetGeo } from '@app/client/common';
import { Store, StoreConfig } from '@datorama/akita';

export interface WebFrameworksTweetsState {
  tweets: TweetData[];
  geoTweets: TweetGeo[];
}

export function createInitialState(): WebFrameworksTweetsState {
  return {
    tweets: [],
    geoTweets: [],
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'web-frameworks-tweets', resettable: true })
export class WebFrameworksTweetsStore extends Store<WebFrameworksTweetsState> {
  constructor() {
    super(createInitialState());
  }

  updateFromTweet(tweets: TweetFilteredStream[]): void {
    this.update(state => {
      const updatedState = {
        tweets: state.tweets,
        geoTweets: state.geoTweets,
      };

      const newTweets: TweetData[] = [];
      const newGeoTweets: TweetGeo[] = [];

      tweets.forEach(tweet => {
        const found = updatedState.tweets.find(t => t.id === tweet._id);
        if (!found) {
          const newTweet = {
            id: tweet._id,
            text: tweet.caption,
            createdAt: tweet.createdAt,
            tagIds: tweet.matching_rules.map(rule => rule._id) ?? [],
            author: {
              name: tweet.user.name,
              profileImage: tweet.user.profile_image_url,
              username: tweet.user.name,
            },
            metrics: tweet.public_metrics,
            tags: tweet.matching_rules.map(rule => rule.tag) ?? [],
          };

          newTweets.push(newTweet);
          newGeoTweets.push({
            ...newTweet,
            lat: tweet.place.bbox[0],
            lng: tweet.place.bbox[1],
            placeName: tweet.place.full_name,
          });
        }
      });

      updatedState.geoTweets = [...newGeoTweets, ...updatedState.geoTweets];
      updatedState.tweets = [...newTweets, ...updatedState.tweets];

      console.log('state', state);
      console.log('updatedState', updatedState);
      return updatedState;
    });
  }
}
