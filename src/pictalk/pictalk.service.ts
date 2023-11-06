import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PictalkSearchDto } from './pictalk_search.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class PictalkService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  private readonly logger = new Logger(PictalkService.name);
  async searchKeyword(
    searchParameterDto: PictalkSearchDto,
    user: any,
  ): Promise<any> {
    const userFilter: Array<{ term: any }> = [];
    // Pictalk DB userId and Keycloak user Id are different
    // We need to retrieve the userId from the DB
    if (user?.email !== undefined) {
      this.logger.log(
        `User email: ${user.email} is searching for ${searchParameterDto.term}`,
      );
      const pictalkUser: User = await this.usersRepository.findOne({
        where: { username: user.email },
      });

      if (pictalkUser) {
        this.logger.log(
          `Found a corresponding pictalk user id ${pictalkUser.id} for ${user.email}`,
        );
        userFilter.push(
          { term: { public_collection_userId: pictalkUser.id } },
          { term: { public_picto_userId: pictalkUser.id } },
        );
      } else {
        userFilter.push(
          { term: { public_collection_public: true } },
          { term: { public_picto_public: true } },
        );
      }
    }
    const response = await this.elasticsearchService.search({
      index: searchParameterDto.index,
      body: {
        size: searchParameterDto.limit,
        query: {
          bool: {
            must: {
              multi_match: {
                query: searchParameterDto.term,
                fields: searchParameterDto.path,
                type: 'best_fields',
              },
            },
            should: userFilter,
            minimum_should_match: 1,
          },
        },
      },
    });

    return response.hits.hits;
  }
}
