import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { PictohubController } from './pictohub.controller';
import { PictohubService } from './pictohub.service';
import { PictalkModule } from 'src/pictalk/pictalk.module';

@Module({
  imports: [DatabaseModule, PictalkModule],
  controllers: [PictohubController],
  providers: [PictohubService],
})
export class PictohubModule {}
