import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsBooleanString, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export class SearchParameterDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    term: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString({each: true})
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
    limit: number = 1;
    
    @ApiProperty()
    @IsOptional()
    @IsString({each: true})
    lang: string[];

    @ApiProperty()
    @IsOptional()
    @IsBooleanString()
    completeIfEmpty?: boolean;
}