import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TweetDataSchema,
  TweetMatchingRuleSchema,
  TweetPlaceSchema,
  TweetPublicMetricsSchema,
  TweetUserSchema,
} from './models';
import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([
      { name: 'TweetUser', schema: TweetUserSchema },
      { name: 'TweetPlace', schema: TweetPlaceSchema },
      { name: 'TweetData', schema: TweetDataSchema },
      { name: 'TweetPublicMetrics', schema: TweetPublicMetricsSchema },
      { name: 'TweetMatchingRule', schema: TweetMatchingRuleSchema },
    ]),
  ],
  controllers: [TweetController],
  providers: [TweetService],
  exports: [TweetService],
})
export class TweetModule {}
