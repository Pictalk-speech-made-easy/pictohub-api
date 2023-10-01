import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
}