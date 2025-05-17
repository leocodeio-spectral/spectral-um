import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AccountEditorMapStatus } from '../../domain/enums/account-editor-map-status.enum';

export class UpdateAccountEditorMapDto {
  @ApiProperty({
    description: 'Status of the mapping',
    required: false,
    enum: AccountEditorMapStatus,
  })
  @IsOptional()
  status?: AccountEditorMapStatus;
}
