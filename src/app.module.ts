import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module';
import { ThrottlerModule, seconds, days } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    DatabaseModule, 
    ThrottlerModule.forRoot([{
      ttl: seconds(60),
      limit: 100,
    }]),
    CacheModule.register({
      ttl: days(5),
      max: 10000,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
