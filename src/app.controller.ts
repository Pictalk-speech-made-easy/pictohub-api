import { Controller, Get, Query, ValidationPipe, UseInterceptors, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { SearchParameterDto } from './search.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiKeyGuard } from './apikey.guard';

@Controller('collection')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('search')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(CacheInterceptor)
  async search(@Query(new ValidationPipe({ transform: true })) searchParametersDto: SearchParameterDto): Promise<any> {
    return this.appService.search(searchParametersDto);
  }

  @Get('keyword')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(CacheInterceptor)
  async searchKeyword(@Query(new ValidationPipe({ transform: true })) searchParametersDto: SearchParameterDto): Promise<any> {
    return this.appService.searchKeyword(searchParametersDto);
  }

}
