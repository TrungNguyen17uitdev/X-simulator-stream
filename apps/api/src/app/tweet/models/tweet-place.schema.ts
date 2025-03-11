import * as mongoose from 'mongoose';

export const TweetPlaceSchema = new mongoose.Schema({
  full_name: { type: String },
  bbox: { type: [Number], required: true },
});

export interface TweetPlaceDoc extends mongoose.Document {
  full_name?: string;
  bbox: number[];
}
