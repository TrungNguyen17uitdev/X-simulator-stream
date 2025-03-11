import * as mongoose from 'mongoose';

export const TweetMatchingRuleSchema = new mongoose.Schema({
  tag: { type: String, required: true },
  thumb: { type: String, required: true },
});

export interface TweetMatchingRuleDoc extends mongoose.Document {
  tag: string;
  thumb: string;
}
