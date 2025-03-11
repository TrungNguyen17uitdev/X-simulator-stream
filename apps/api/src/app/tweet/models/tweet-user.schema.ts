import * as mongoose from 'mongoose';

export const TweetUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profile_image_url: { type: String, required: true },
});

export interface TweetUserDoc extends mongoose.Document {
  name: string;
  profile_image_url: string;
}
