import { Inject, Injectable, Logger } from '@nestjs/common';
import { Db } from 'mongodb';
import { SearchParameterDto } from './search.dto';
import { excludeLocales } from 'src/utils/locales';
import { autocomplete, fuzzysearch, findmorelike, exactmatch } from 'src/utils/atlas';
import { sortResults } from 'src/utils/words';

@Injectable()
export class PictohubService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) { }
  private readonly logger = new Logger(PictohubService.name);

  async searchKeyword(searchParameterDto: SearchParameterDto): Promise<any> {
    const excludedLocales = excludeLocales([...searchParameterDto.languages, searchParameterDto.locale, 'en']);
    try {
      const result = await this.db
        .collection('pictograms')
        .aggregate([
          {
            $search: {
              index: searchParameterDto.index ?? "search",
              compound: {
                should: [
                  exactmatch(searchParameterDto.term, `*`),
                  fuzzysearch(searchParameterDto.term, `*`),
                ],
                minimumShouldMatch: 1
              }
            }
          },
          {
            $limit: searchParameterDto.limit,
          },
          {
            $unset: excludedLocales,
          },
        ]
        )
        .toArray();
      let startTime = new Date().getTime();
      const sorted = sortResults(result, searchParameterDto.locale, searchParameterDto.term);
      const endTime = new Date().getTime();
      this.logger.log(
        `Found ${result.length} pictograms for ${searchParameterDto.term} in ${searchParameterDto.index}. Sorting took ${endTime - startTime}ms`,
      );
      if (!searchParameterDto.expanded) {
        for (const pictogram of sorted) {
          delete pictogram.filters;
          delete pictogram.analytics;
          delete pictogram.created;
          delete pictogram.updated;
          for (const key of Object.keys(pictogram.translations)) {
            for (const entry of pictogram.translations[key]) {
              if (entry.lexical_siblings) {
                entry.lexical_siblings = entry.lexical_siblings.slice(0, 4);
              }
              if (entry.synonyms) {
                entry.synonyms = entry.synonyms.slice(0, 4);
              }
              delete entry.conjugates;
            }
          }
        };
      }
      return sorted;
    } catch (e) {
      throw new Error(e);
    }
  }
}