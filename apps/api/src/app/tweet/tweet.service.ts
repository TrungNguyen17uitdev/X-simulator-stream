import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TweetDataDoc,
  TweetMatchingRuleDoc,
  TweetPlaceDoc,
  TweetPublicMetricsDoc,
  TweetUserDoc,
} from './models';
import { TweetDataDto, TweetMatchingRuleDto, TweetUserDto } from './tweet.dto';

@Injectable()
export class TweetService {
  constructor(
    @InjectModel('TweetData')
    private readonly tweetData: Model<TweetDataDoc>,
    @InjectModel('TweetPlace')
    private readonly tweetPlace: Model<TweetPlaceDoc>,
    @InjectModel('TweetPublicMetrics')
    private readonly tweetPublicMetrics: Model<TweetPublicMetricsDoc>,
    @InjectModel('TweetMatchingRule')
    private readonly tweetMatchingRule: Model<TweetMatchingRuleDoc>,
    @InjectModel('TweetUser')
    private readonly tweetUser: Model<TweetUserDoc>,
    private readonly httpService: HttpService,
  ) {}

  getTweet(rules: string[] = []) {
    return this.tweetData
      .find({ matching_rules: { $in: rules } })
      .populate('user')
      .populate('public_metrics')
      .populate('place')
      .populate('matching_rules')
      .sort({ '_id': -1 });
  }

  async getTweetsById(ids: string[], rules: string[] = []) {
    return this.tweetData
      .find({
        matching_rules: { $in: rules },
        _id: { $all: ids },
      })
      .populate('user')
      .populate('public_metrics')
      .populate('place')
      .populate('matching_rules')
      .sort({ '_id': -1 });
  }

  getRule(keyword = '') {
    return this.tweetMatchingRule.find({ tag: new RegExp(keyword, 'i') }).limit(20);
  }

  getRulesById(ruleIds: string[]) {
    return this.tweetMatchingRule.find({
      _id: { $in: ruleIds },
    });
  }

  getUser(keyword = '') {
    return this.tweetUser.find({ name: new RegExp(keyword, 'i') }).limit(20);
  }

  getRandomUsers(count: number) {
    return this.tweetUser.aggregate([{ $sample: { size: count } }]).exec();
  }

  async getPlaces(code: string) {
    return this.httpService.axiosRef
      .get('https://hiveword.com/papi/random/locationNames', {
        params: { country: code },
      })
      .then(res => res.data);
  }

  async createTweet(tweets: TweetDataDto[]) {
    const places = await Promise.all(tweets.map(tweet => this.tweetPlace.create(tweet.place)));
    const public_metrics = await Promise.all(
      tweets.map(tweet => this.tweetPublicMetrics.create(tweet.public_metrics)),
    );

    const tweetsToInsert = tweets.map((tweet, index) => ({
      matching_rules: tweet.matching_rules,
      user: tweet.user,
      public_metrics: public_metrics[index],
      place: places[index],
      caption: tweet.caption,
    }));

    return this.tweetData.insertMany(tweetsToInsert);
  }

  async createUser(users: TweetUserDto[]) {
    await this.tweetUser.insertMany(users);
    return true;
  }

  async createRule(rules: TweetMatchingRuleDto[]) {
    await this.tweetMatchingRule.insertMany(rules);
    return true;
  }
}
