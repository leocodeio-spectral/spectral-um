import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { AccountEditorMapStatus } from '../../domain/enums/account-editor-map-status.enum';

export class CreateAccountEditorMapDto {
  @ApiProperty({ description: 'Account ID', required: true })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Editor ID', required: true })
  @IsNotEmpty()
  @IsUUID()
  editorId: string;

  @ApiProperty({
    description: 'Status of the mapping',
    required: false,
    enum: AccountEditorMapStatus,
  })
  status?: AccountEditorMapStatus = AccountEditorMapStatus.ACTIVE;
}
