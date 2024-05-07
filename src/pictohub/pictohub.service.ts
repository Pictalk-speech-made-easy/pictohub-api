import { Inject, Injectable, Logger } from '@nestjs/common';
import { Db, WithId } from 'mongodb';
import { SearchParameterDto } from './search.dto';

@Injectable()
export class PictohubService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) { }
  private readonly logger = new Logger(PictohubService.name);

  async searchKeyword(searchParameterDto: SearchParameterDto): Promise<any> {
    try {
      const lang_array = this.filterLanguage(searchParameterDto);
      let priorizedPath = undefined;
      if (
        searchParameterDto.path.filter((p) => p.includes('.word')).length > 0
      ) {
        priorizedPath = searchParameterDto.path.filter((p) =>
          p.includes('.word'),
        ); // We will prioritize the keyword field
      }
      let result = [];
      if (priorizedPath && priorizedPath.length > 0) {
        const lang = priorizedPath[0].split('.')[1]; // CHANGE IT
        const addFieldsProperty = `originalDoc.translations.${lang}`
        console.log(lang)
        result = await this.db
          .collection('pictograms')
          .aggregate([
            {
              $search: {
                index: searchParameterDto.index,
                compound: {
                  should: [
                    {
                      autocomplete: {
                        query: searchParameterDto.term,
                        path: priorizedPath[0],
                        score: {
                          boost: {
                            value: 2
                          }
                        }
                      }
                    },
                    {
                      text: {
                        query: searchParameterDto.term,
                        path: priorizedPath,
                        fuzzy: {
                          maxEdits: 1,
                          prefixLength: 3
                        },
                        score: {
                          boost: {
                            value: 1
                          }
                        }
                      }
                    },
                    {
                      moreLikeThis: {
                        like: priorizedPath.map((pa: string) => {
                          const obj = {};
                          obj[pa] = searchParameterDto.term;
                          return obj;
                        }),
                        score: {
                          boost: {
                            value: 1, // Higher value means higher priority
                          },
                        },
                      },
                    },
                  ],
                  minimumShouldMatch: 1
                }
              }
            },
            {
              $addFields: {
                searchScore: { $meta: "searchScore" }
              }
            },
            {
              $unwind: {
                path: `$translations.${lang}`,
                includeArrayIndex: "arrayIndex"
              }
            },
            {
              $addFields: {
                wordLength: { $strLenCP: `$${priorizedPath[0]}` },
                lengthDifference: { $abs: { $subtract: [searchParameterDto.term.length, { $strLenCP: `$${priorizedPath[0]}` }] } }
              }
            },
            {
              $addFields: {
                score: {
                  $multiply: [
                    { $divide: [1, { $add: ["$lengthDifference", 1] }] },
                    "$searchScore"
                  ]
                }
              }
            },

            {
              $sort: {
                score: -1
              }
            },
            {
              $group: {
                _id: "$_id",
                originalDoc: { $first: "$$ROOT" },
                translations: { $push: `$translations.${lang}` },
                bestMatchWord: { $first: `$${priorizedPath[0]}` },
                bestScore: { $first: "$score" },
                bestWordIndex: { $first: "$arrayIndex" }
              }
            },
            {
              $addFields: {
                addFieldsProperty: "$translations",
                "originalDoc.bestMatchWord": "$bestMatchWord",
                "originalDoc.bestScore": "$bestScore",
                "originalDoc.bestWordIndex": "$bestWordIndex"
              }
            },
            {
              $replaceRoot: {
                newRoot: "$originalDoc"
              }
            },
            {
              $sort: {
                bestWordIndex: 1,
                score: -1
              }
            },
            {
              $project: {
                searchScore: 0,
                wordLength: 0,
                lengthDifference: 0,
                score: 0,
                arrayIndex: 0,
              }
            },
            {
              $limit: searchParameterDto.limit,
            },
          ]
          )
          .toArray();
          result.sort((a, b) => {
            const diffA = calculateCharacterDifferences(a.bestMatchWord, searchParameterDto.term);
            const diffB = calculateCharacterDifferences(b.bestMatchWord, searchParameterDto.term);
            return diffA - diffB;
          });
      } else {
        result = await this.db
          .collection('pictograms')
          .aggregate([
            {
              $search: {
                index: searchParameterDto.index,
                moreLikeThis: {
                  like: searchParameterDto.path.map((pa: string) => {
                    const obj = {};
                    obj[pa] = searchParameterDto.term;
                    return obj;
                  }),
                  score: {
                    boost: {
                      value: 2, // Higher value means higher priority
                    },
                  },
                },
              },
            },
            {
              $limit: searchParameterDto.limit,
            },
            {
              $addFields: {
                score: {
                  $meta: 'searchScore',
                },
              },
            },
            // The field format is: translations.LANG
            // We will unset all the LANG != search language
            {
              $unset: lang_array,
            },
          ])
          .toArray();
      }
      console.log(`Normal exact search returned ${result.length} results`);
      if (result.length === 0 && searchParameterDto.completeIfEmpty) {
        result = await this.db
          .collection('pictograms')
          .aggregate([
            {
              $search: {
                index: 'default',
                text: {
                  query: searchParameterDto.term,
                  path: searchParameterDto.path,
                },
              },
            },
            {
              $addFields: {
                score: {
                  $meta: 'searchScore',
                },
              },
            },
            {
              $limit: searchParameterDto.limit,
            },
            // The field format is: translations.LANG
            // We will unset all the LANG != search language
            {
              $unset: lang_array,
            },
          ])
          .toArray();
      }
      this.logger.log(
        `Retrieving keyword ${result.length} results for ${searchParameterDto.term} in ${searchParameterDto.index}`,
      );
      return result;
    } catch (e) {
      throw new Error(e);
    }
  }

  filterLanguage(searchParameterDto: SearchParameterDto): string[] {
    let lang_array = [
      'translations.an',
      'translations.ar',
      'translations.en',
      'translations.es',
      'translations.fr',
      'translations.it',
      'translations.nl',
      'translations.pl',
      'translations.pt',
      'translations.ru',
      'translations.tr',
      'translations.zh',
      'translations.bg',
      'translations.br',
      'translations.ca',
      'translations.de',
      'translations.el',
      'translations.fa',
      'translations.gl',
      'translations.he',
      'translations.hr',
      'translations.hu',
      'translations.ko',
      'translations.lt',
      'translations.lv',
      'translations.mk',
      'translations.nb',
      'translations.ro',
      'translations.sk',
      'translations.sq',
      'translations.sv',
      'translations.sr',
      'translations.val',
      'translations.uk',
      'translations.et',
      'translations.eu',
    ];
    if (!searchParameterDto.lang || searchParameterDto.lang.length === 0) {
      const lang = searchParameterDto.path[0].split('.')[1];
      const indexOfLang = lang_array.indexOf('translations.' + lang);
      if (indexOfLang !== -1) {
        lang_array.splice(indexOfLang, 1);
      }
      lang_array.push('translations.fr.lvf_entries');
      return lang_array;
    } else {
      lang_array = lang_array.filter((lang) => {
        // Regex has to match \.LANG for each lang
        return !lang.match(
          new RegExp('\\.' + searchParameterDto.lang.join('|\\.')),
        );
      });
      lang_array.push('translations.fr.lvf_entries');
      return lang_array;
    }
  }
}

function calculateCharacterDifferences(str1: string, str2: string): number {
  const length = Math.max(str1.length, str2.length);
  let differences = 0;

  for (let i = 0; i < length; i++) {
    if (str1[i] !== str2[i]) {
      differences++;
    }
  }

  return differences;
}
