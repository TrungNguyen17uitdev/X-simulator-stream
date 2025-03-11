import * as mongoose from 'mongoose';

export const TweetPublicMetricsSchema = new mongoose.Schema({
  retweet_count: { type: Number, required: true },
  reply_count: { type: Number, required: true },
  like_count: { type: Number, required: true },
});

export interface TweetPublicMetricsDoc extends mongoose.Document {
  retweet_count: number;
  reply_count: number;
  like_count: number;
}
