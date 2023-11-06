import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiKeyGuard } from '../apikey.guard';
import { PictalkService } from './pictalk.service';
import { PictalkSearchDto } from './pictalk_search.dto';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';

@Controller('pictalk')
export class PictalkController {
  constructor(private readonly pictalkService: PictalkService) {}

  @Get()
  @Public(false)
  searchKeyword(
    @AuthenticatedUser() user: any,
    @Query(new ValidationPipe({ transform: true }))
    searchParametersDto: PictalkSearchDto,
  ): any {
    return this.pictalkService.searchKeyword(searchParametersDto, user);
  }
}
