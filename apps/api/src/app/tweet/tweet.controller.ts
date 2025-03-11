import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateTweetDto, CreateTweetRuleDto, CreateTweetUserDto } from './tweet.dto';
import { TweetService } from './tweet.service';

@Controller('tweet')
export class TweetController {
  constructor(private twService: TweetService) {}

  @Get()
  getTweets(@Query('rules') rules: string[]) {
    return this.twService.getTweet(rules);
  }

  @Get('rule')
  getRules(@Query('keyword') keyword: string) {
    return this.twService.getRule(keyword);
  }

  @Get('user')
  getUsers(@Query('keyword') keyword: string) {
    return this.twService.getUser(keyword);
  }

  @Get('random-user')
  async getRandomUsers(@Query('count') count: number) {
    return this.twService.getRandomUsers(Number(count) || 5); // Default to 5 random users
  }

  @Get('places')
  getPlaces(@Query('country') country: string) {
    return this.twService.getPlaces(country);
  }

  @Post('rule')
  createRule(@Body() dto: CreateTweetRuleDto) {
    return this.twService.createRule(dto.rules);
  }

  @Post('user')
  createUser(@Body() dto: CreateTweetUserDto) {
    return this.twService.createUser(dto.users);
  }

  @Post()
  createTweet(@Body() dto: CreateTweetDto) {
    return this.twService.createTweet(dto.tweets);
  }
}
