import * as mongoose from 'mongoose';

export const TweetDataSchema = new mongoose.Schema(
  {
    caption: { type: String, required: true },
    public_metrics: { type: mongoose.Types.ObjectId, required: true, ref: 'TweetPublicMetrics' },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'TweetUser' },
    place: { type: mongoose.Types.ObjectId, required: true, ref: 'TweetPlace' },
    matching_rules: {
      type: [{ type: mongoose.Types.ObjectId, ref: 'TweetMatchingRule' }],
      required: true,
    },
  },
  { timestamps: true },
);

export interface TweetDataDoc extends mongoose.Document {
  caption: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
  };
  user: string;
  place: {
    bbox: number[];
    full_name?: string;
  };
  matching_rules: string[];
}
