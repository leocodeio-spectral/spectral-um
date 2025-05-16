import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { MediaType } from '../../domain/enums/media-type.enum';

export class CreateMediaDto {
  @ApiProperty({ description: 'User ID', required: true })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Account ID', required: true })
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ description: 'Media type', required: true })
  @IsString()
  @IsNotEmpty()
  type: MediaType;
}
