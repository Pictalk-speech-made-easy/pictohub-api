import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PictalkResultDTO {
  @IsString()
  _index: string;

  @IsString()
  _id: string;

  @IsNumber()
  _score: number;

  @ValidateNested()
  @Type(() => SourceDTO)
  _source: SourceDTO;
}

class SourceDTO {
  @IsString()
  schema: string;

  @IsNumber()
  public_picto_userid: number;

  @IsString()
  public_picto_color: string;

  @IsString()
  Table: string;

  @IsNumber()
  public_picto_id: number;

  @IsDate()
  public_picto_createddate: Date;

  @IsString()
  public_picto_image: string;

  @IsArray()
  public_picto_editors: any[];

  @IsArray()
  public_picto_viewers: any[];

  @IsBoolean()
  public_picto_public: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeechDTO)
  public_picto_speech: SpeechDTO[];

  @IsString()
  public_picto_pictohubid: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeaningDTO)
  public_picto_meaning: MeaningDTO[];

  @IsString()
  Database: string;

  @IsString()
  id: string;

  @IsDate()
  public_picto_updateddate: Date;

  @IsNumber()
  public_picto_priority: number;

  @IsString()
  _timestamp: string;
}

class SpeechDTO {
  [languageCode: string]: string;
}

class MeaningDTO {
  [languageCode: string]: string;
}
