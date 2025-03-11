import { Place } from './place';
import { Rule } from './rule';
import { User } from './user';

export interface Tweet {
  caption: string;
  user: string;
  public_metrics: TweetPublicMetrics;
  place: Place;
  matching_rules: string[];
}

export interface TweetPublicMetrics {
  retweet_count: number;
  reply_count: number;
  like_count: number;
}

export interface TweetFilteredStream {
  _id: string;
  caption: string;
  createdAt: Date;
  user: User;
  matching_rules: Rule[];
  public_metrics: TweetPublicMetrics;
  place: Place;
}

export interface Author {
  name: string;
  profileImage: string;
  username: string;
}

export interface TweetData {
  id: string;
  author: Author;
  text: string;
  metrics: TweetPublicMetrics;
  tagIds: string[];
  tags: string[];
}

export interface TweetGeo extends TweetData {
  placeName: string;
  lat: number;
  lng: number;
}
