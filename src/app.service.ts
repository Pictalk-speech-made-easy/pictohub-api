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
    try {
      const lang_array = this.filterLanguage(searchParameterDto);
      let priorizedPath = undefined;
      let otherPath = undefined;
      if (searchParameterDto.path.filter((p) => p.includes('.keyword')).length > 0) {
        priorizedPath = searchParameterDto.path.filter((p) => p.includes('.keyword')); // We will prioritize the keyword field
        otherPath = searchParameterDto.path.filter((p) => !p.includes('.keyword'));
      }
      let result = [];
      if (priorizedPath.length > 0 && otherPath.length > 0) {
        result = await this.db.collection('pictohub').aggregate([
          {
            "$search": {
              "index": searchParameterDto.index,
              "compound": {
                "should": [
                    {
                      "moreLikeThis": {
                        "like": priorizedPath.map((pa: string) => {
                          const obj = {};
                          obj[pa] = searchParameterDto.term;
                          return obj;
                        }),
                        "score": {
                          "boost": {
                              "value": 5  // Higher value means higher priority
                          }
                      }
                      },
                    },
                    {
                        "text": {
                            "query": searchParameterDto.term,
                            "path": otherPath
                            // Default boost value is 1
                        }
                    }
                ]
            }
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
      } else {
        result = await this.db.collection('pictohub').aggregate([
          {
            "$search": {
              "index": searchParameterDto.index,
              "moreLikeThis": {
                "like": searchParameterDto.path.map((pa: string) => {
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
      }
      
      
    if (result.length === 0 && searchParameterDto.completeIfEmpty) {
      result = await this.db.collection('pictohub').aggregate([
        {
          "$search": {
            "index": 'default',
            "text": {
              "query": searchParameterDto.term,
              "path": searchParameterDto.path,
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
    try {
      const lang_array = this.filterLanguage(searchParameterDto);
      const result = await this.db.collection('pictohub').aggregate([
        {
          "$search": {
            "index": searchParameterDto.index,
            "text": {
              "query": searchParameterDto.term,
              "path": searchParameterDto.path,
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

  filterLanguage(searchParameterDto: SearchParameterDto): string[] {
    let lang_array = ['keywords.an', 'keywords.ar', 'keywords.en', 'keywords.es', 'keywords.fr', 'keywords.it', 'keywords.nl', 'keywords.pl', 'keywords.pt', 'keywords.ru', 'keywords.tr', 'keywords.zh', 'keywords.bg', 'keywords.br', 'keywords.ca', 'keywords.de', 'keywords.el', 'keywords.fa', 'keywords.gl', 'keywords.he', 'keywords.hr', 'keywords.hu', 'keywords.ko', 'keywords.lt', 'keywords.lv', 'keywords.mk', 'keywords.nb', 'keywords.ro', 'keywords.sk', 'keywords.sq', 'keywords.sv', 'keywords.sr', 'keywords.val', 'keywords.uk', 'keywords.et', 'keywords.eu']
    if (!searchParameterDto.lang || searchParameterDto.lang.length === 0) {
      const lang = searchParameterDto.path[0].split('.')[1];
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
