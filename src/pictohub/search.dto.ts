import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { locales } from 'src/utils/locales';

export class SearchParameterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  term: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(locales)
  locale: string;

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
  path: string[] = [];

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['search', 'default', 'keyword'])
  index: string = 'search';

  @Type(() => Number)
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(32)
  limit: number = 8;

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
  languages: string[] = [];
}
