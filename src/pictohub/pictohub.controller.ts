import {
  Controller,
  Get,
  Query,
  ValidationPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { PictohubService } from './pictohub.service';
import { SearchParameterDto } from './search.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiKeyGuard } from '../apikey.guard';

@Controller('pictohub')
export class PictohubController {
  constructor(private readonly appService: PictohubService) {}

  @Get('keyword')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(CacheInterceptor)
  async searchKeyword(
    @Query(new ValidationPipe({ transform: true }))
    searchParametersDto: SearchParameterDto,
  ): Promise<any> {
    return this.appService.searchKeyword(searchParametersDto);
  }
}
