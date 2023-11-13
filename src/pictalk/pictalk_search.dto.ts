import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';
import { SearchParameterDto } from 'src/pictohub/search.dto';

// Search Dto for Pictalk
export class PictalkSearchDto extends SearchParameterDto {
  // Path can take values from 'public_collection_meaning','public_collection_speech','public_picto_meaning','public_picto_speech'
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
  @Matches(
    /^(public_collection_meaning|public_collection_speech|public_picto_meaning|public_picto_speech)\.[a-z]{2}$/,
    {
      each: true,
    },
  )
  path: string[];
}
