import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { PictohubController } from './pictohub.controller';
import { PictohubService } from './pictohub.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PictohubController],
  providers: [PictohubService],
})
export class PictohubModule {}
