import { Inject, Injectable, Logger } from '@nestjs/common';
import { Db, WithId } from 'mongodb';
import { SearchParameterDto } from './search.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) {}
  private readonly logger = new Logger(AppService.name);
  
  async searchKeyword(searchParameterDto: SearchParameterDto): Promise<any> {
    let path;
    try {
      // Check if the path is an array or a string
      if (typeof searchParameterDto.path === 'string') {
        path = [searchParameterDto.path];
      } else {
        path = searchParameterDto.path;
      }
      const lang_array = this.filterLanguage(searchParameterDto, path);
      let result = await this.db.collection('pictohub').aggregate([
        {
          "$search": {
            "index": searchParameterDto.index,
            "moreLikeThis": {
              "like": path.map((pa: string) => {
                const obj = {};
                obj[pa] = searchParameterDto.term;
                return obj;
              }),
            },
          },
        },
        {
          "$limit": searchParameterDto.limit
        },
        // The field format is: keywords.LANG
        // We will unset all the LANG != search language
        {
          "$unset": lang_array
        }
    ],
    ).toArray();
    if (result.length === 0 && searchParameterDto.completeIfEmpty) {
      result = await this.db.collection('pictohub').aggregate([
        {
          "$search": {
            "index": 'default',
            "text": {
              "query": searchParameterDto.term,
              "path": path,
            }
          },
          
        },
        {
          "$addFields": {
              "highlights": {
                  "$meta": "searchHighlights"
              }
          }
      },
      {
        "$limit": searchParameterDto.limit
      },
      // The field format is: keywords.LANG
      // We will unset all the LANG != search language
      {
        "$unset": lang_array
      }
    ],
    ).toArray();
    }
    this.logger.log(`Retrieving keyword ${result.length} results for ${searchParameterDto.term} in ${searchParameterDto.index}`)
    return result;
  } catch (e) {
      throw new Error(e);
    }
  }
  async search(searchParameterDto: SearchParameterDto): Promise<any> {
    let path;
    try {
      // Check if the path is an array or a string
      if (typeof searchParameterDto.path === 'string') {
        path = [searchParameterDto.path];
      } else {
        path = searchParameterDto.path;
      }
      const lang_array = this.filterLanguage(searchParameterDto, path);
      const result = await this.db.collection('pictohub').aggregate([
        {
          "$search": {
            "index": searchParameterDto.index,
            "text": {
              "query": searchParameterDto.term,
              "path": path,
            }
          },
          
        },
        {
          "$addFields": {
              "highlights": {
                  "$meta": "searchHighlights"
              }
          }
      },
      {
        "$limit": searchParameterDto.limit
      },
      // The field format is: keywords.LANG
      // We will unset all the LANG != search language
      {
        "$unset": lang_array
      }
    ],
    ).toArray();
    this.logger.log(`Retrieving ${result.length} results for ${searchParameterDto.term} in ${searchParameterDto.index}`)
    return result;
  } catch (e) {
      throw new Error(e);
    }
  }

  filterLanguage(searchParameterDto: SearchParameterDto, path: string): string[] {
    let lang_array = ['keywords.an', 'keywords.ar', 'keywords.en', 'keywords.es', 'keywords.fr', 'keywords.it', 'keywords.nl', 'keywords.pl', 'keywords.pt', 'keywords.ru', 'keywords.tr', 'keywords.zh', 'keywords.bg', 'keywords.br', 'keywords.ca', 'keywords.de', 'keywords.el', 'keywords.fa', 'keywords.gl', 'keywords.he', 'keywords.hr', 'keywords.hu', 'keywords.ko', 'keywords.lt', 'keywords.lv', 'keywords.mk', 'keywords.nb', 'keywords.ro', 'keywords.sk', 'keywords.sq', 'keywords.sv', 'keywords.sr', 'keywords.val', 'keywords.uk', 'keywords.et', 'keywords.eu']
    if (!searchParameterDto.lang || searchParameterDto.lang.length === 0) {
      const lang = path[0].split('.')[1];
      const indexOfLang = lang_array.indexOf('keywords.' + lang);
      if (indexOfLang !== -1) {
        lang_array.splice(indexOfLang, 1);
      }
      return lang_array;
    } else {
      lang_array = lang_array.filter((lang) => {
        // Regex has to match \.LANG for each lang
        return !lang.match(new RegExp("\\." + searchParameterDto.lang.join("|\\.")));
      });
      return lang_array;
    }
}
}
