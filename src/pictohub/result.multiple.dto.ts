import { PictalkResultDTO } from 'src/pictalk/result.dto';
import { KeywordDTO } from './result.dto';

export class MultipleReturnDto {
  pictohub: KeywordDTO[];
  pictalk: PictalkResultDTO[];
}
