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
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';
import { PictalkService } from 'src/pictalk/pictalk.service';
import { KeywordDTO } from './result.dto';
import { MultipleReturnDto } from './result.multiple.dto';
import { PictalkResultDTO } from 'src/pictalk/result.dto';

@Controller('pictohub')
export class PictohubController {
  constructor(
    private readonly appService: PictohubService,
    private readonly pictalkService: PictalkService,
  ) {}
  @Public(false)
  @Get('keyword')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(CacheInterceptor)
  async searchKeyword(
    @Query(new ValidationPipe({ transform: true }))
    searchParametersDto: SearchParameterDto,
    @AuthenticatedUser()
    user: any,
  ): Promise<KeywordDTO | MultipleReturnDto> {
    if (searchParametersDto.pictalk && user?.email !== undefined) {
      console.log('Pictalk search');
      const pictalk_searchParametersDto = { ...searchParametersDto };
      // Typical path keywords.fr.keyword
      const extractedLang = pictalk_searchParametersDto.path[0].split('.')[1];
      pictalk_searchParametersDto.index = 'search-pictograms';
      pictalk_searchParametersDto.path = [
        `public_picto_speech.${extractedLang}`,
        `public_picto_meaning.${extractedLang}`,
        `public_collection_speech.${extractedLang}`,
        `public_collection_meaning.${extractedLang}`,
      ];
      const pictos: PictalkResultDTO[] =
        await this.pictalkService.searchKeyword(
          pictalk_searchParametersDto,
          user,
        );
      const keywords: KeywordDTO[] = await this.appService.searchKeyword(
        searchParametersDto,
      );
      const multipleReturnDto = new MultipleReturnDto();
      multipleReturnDto.pictohub = keywords;
      multipleReturnDto.pictalk = pictos;
      return multipleReturnDto;
    }
    return this.appService.searchKeyword(searchParametersDto);
  }
}
