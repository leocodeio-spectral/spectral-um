import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreatorEditorMapStatus } from '../../domain/enums/creator-editor-map-status.enum';

export class CreateCreatorEditorMapDto {
  @ApiProperty({ description: 'Creator ID', required: true })
  @IsNotEmpty()
  @IsUUID()
  creatorId: string;

  @ApiProperty({ description: 'Editor ID', required: true })
  @IsNotEmpty()
  @IsUUID()
  editorId: string;

  @ApiProperty({
    description: 'Status of the mapping',
    required: false,
    enum: CreatorEditorMapStatus,
  })
  status?: CreatorEditorMapStatus = CreatorEditorMapStatus.ACTIVE;
}
