import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TweetPublicMetricsDto {
  @IsNumber()
  retweet_count: number;

  @IsNumber()
  reply_count: number;

  @IsNumber()
  like_count: number;
}

export class TweetUserDto {
  @IsString()
  name: string;

  @IsString()
  profile_image_url: string;
}

export class TweetPlaceDto {
  @IsArray()
  bbox: number[];

  @IsString()
  full_name?: string;
}

export class TweetMatchingRuleDto {
  @IsString()
  thumb: string;

  @IsString()
  tag: string;
}

export class TweetDataDto {
  @IsString()
  @IsNotEmpty()
  caption: string;

  @ValidateNested()
  @Type(() => TweetPublicMetricsDto)
  public_metrics: TweetPublicMetricsDto;

  @IsString()
  @IsNotEmpty()
  user: string;

  @ValidateNested()
  @Type(() => TweetPlaceDto)
  place: TweetPlaceDto;

  @IsArray()
  @IsNotEmpty()
  matching_rules: string[];
}

export class CreateTweetDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TweetDataDto)
  tweets: TweetDataDto[];
}

export class CreateTweetUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TweetUserDto)
  users: TweetUserDto[];
}

export class CreateTweetRuleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TweetMatchingRuleDto)
  rules: TweetMatchingRuleDto[];
}
