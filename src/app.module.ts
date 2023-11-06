import { ThrottlerModule, days, seconds } from '@nestjs/throttler';
import { PictohubModule } from './pictohub/pictohub.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PictalkModule } from './pictalk/pictalk.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 100,
      },
    ]),
    CacheModule.register({
      ttl: days(5),
      max: 10000,
      isGlobal: true,
    }),

    PictohubModule,
    PictalkModule,
  ],
})
export class AppModule {}
