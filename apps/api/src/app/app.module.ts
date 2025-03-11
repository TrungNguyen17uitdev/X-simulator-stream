import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { TweetModule } from './tweet/tweet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    MongooseModule.forRoot(process.env['MONGODB_URL']),
    TweetModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
  exports: [AppGateway],
})
export class AppModule {}
