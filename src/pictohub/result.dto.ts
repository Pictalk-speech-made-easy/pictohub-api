import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class KeywordDTO {
  @IsString()
  keyword: string;

  @IsBoolean()
  hasLocution: boolean;

  @IsInt()
  type: number;

  @IsString()
  plural: string;

  @IsString()
  linguistic_category: string;

  @IsString({ each: true })
  synonymes: string[];

  @ValidateNested()
  @Type(() => KeywordCombinationDTO)
  combinations: KeywordCombinationDTO;
}

class KeywordCombinationDTO {
  @IsString({ each: true })
  pre_verbe_combinations: string[];

  @IsString({ each: true })
  post_verbe_combinations: string[];

  @IsString({ each: true })
  pre_adjectif_combinations: string[];

  @IsString({ each: true })
  post_adjectif_combinations: string[];
}

class ResultDTO {
  @IsInt()
  _id: number;

  @IsBoolean()
  schematic: boolean;

  @IsBoolean()
  sex: boolean;

  @IsBoolean()
  violence: boolean;

  @IsBoolean()
  aac: boolean;

  @IsBoolean()
  aacColor: boolean;

  @IsBoolean()
  skin: boolean;

  @IsBoolean()
  hair: boolean;

  @IsInt()
  downloads: number;

  @IsString({ each: true })
  categories: string[];

  @IsString({ each: true })
  synsets: string[];

  @IsString({ each: true })
  tags: string[];

  @ValidateNested()
  @Type(() => KeywordDTO)
  keywords: KeywordDTO[];

  @IsString()
  created: string;

  @IsString()
  lastUpdated: string;

  @IsUrl()
  external_alt_image: string;

  @IsString({ each: true })
  image: string[];

  @IsNumber()
  score: number;
}
