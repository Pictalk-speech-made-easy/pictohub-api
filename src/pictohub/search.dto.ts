import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsBooleanString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class SearchParameterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  term: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform((value) => {
    if (typeof value.value === 'string') {
      return [value.value];
    } else if (Array.isArray(value.value)) {
      return value.value.map((v) => String(v));
    }
    return value.value;
  })
  @IsString({ each: true })
  path: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  index: string;

  @Type(() => Number)
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  limit = 1;

  @ApiProperty()
  @IsOptional()
  @Transform((value) => {
    if (typeof value.value === 'string') {
      return [value.value];
    } else if (Array.isArray(value.value)) {
      return value.value.map((v) => String(v));
    }
    return value.value;
  })
  @IsString({ each: true })
  @ArrayMinSize(1)
  lang: string[];

  @ApiProperty()
  @IsOptional()
  @IsBooleanString()
  completeIfEmpty?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBooleanString()
  pictalk?: boolean;
}
