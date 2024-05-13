import { ThrottlerModule, days, seconds } from '@nestjs/throttler';
import { PictohubModule } from './pictohub/pictohub.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PictalkModule } from './pictalk/pictalk.module';
import { SentryModule } from '@ntegral/nestjs-sentry';

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
    SentryModule.forRoot({
      dsn: 'https://f6a20c9301bdf98c3caa9b33c415bf3f@o1135783.ingest.us.sentry.io/4507248851812352',
      environment: process.env.NODE_ENV,
      logLevels: ['debug']
    }),
    PictohubModule,
    PictalkModule,
  ],
})
export class AppModule {}
