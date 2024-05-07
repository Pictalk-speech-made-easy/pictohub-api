import { Inject, Injectable, Logger } from '@nestjs/common';
import { Db } from 'mongodb';
import { SearchParameterDto } from './search.dto';
import { excludeLocales } from 'src/utils/locales';
import { autocomplete, fuzzysearch, findmorelike, sortByRelevance } from 'src/utils/atlas';
import { charDiff } from 'src/utils/words';

@Injectable()
export class PictohubService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) { }
  private readonly logger = new Logger(PictohubService.name);

  async searchKeyword(searchParameterDto: SearchParameterDto): Promise<any> {
    const excludedLocales = excludeLocales([...searchParameterDto.languages, searchParameterDto.locale, 'en']);
    const defaultPath = `translations.${searchParameterDto.locale}.word`
    if(searchParameterDto.path.length === 0) searchParameterDto.path.push(defaultPath);
    try {
      const result = await this.db
        .collection('pictograms')
        .aggregate([
          {
            $search: {
              index: searchParameterDto.index,
              compound: {
                should: [
                  autocomplete(searchParameterDto.term, defaultPath),
                  fuzzysearch(searchParameterDto.term, defaultPath),
                  findmorelike(searchParameterDto.term, searchParameterDto.path),
                ],
                minimumShouldMatch: 1
              }
            }
          },
          ...sortByRelevance(searchParameterDto.term, defaultPath, searchParameterDto.locale),
          {
            $unset: excludedLocales,
          },
          {
            $limit: searchParameterDto.limit,
          },
        ]
        )
        .toArray();
      this.logger.log(
        `Retrieving keyword ${result.length} results for ${searchParameterDto.term} in ${searchParameterDto.index}`,
      );
      return result.sort((a, b) => {
        const diffA = charDiff(a.bestMatchWord, searchParameterDto.term);
        const diffB = charDiff(b.bestMatchWord, searchParameterDto.term);
        return diffA - diffB;
      });
    } catch (e) {
      throw new Error(e);
    }
  }
}