import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreatorEditorMapStatus } from '../../domain/enums/creator-editor-map-status.enum';

export class UpdateCreatorEditorMapDto {
  @ApiProperty({
    description: 'Status of the mapping',
    required: false,
    enum: CreatorEditorMapStatus,
  })
  @IsOptional()
  status?: CreatorEditorMapStatus;
}
