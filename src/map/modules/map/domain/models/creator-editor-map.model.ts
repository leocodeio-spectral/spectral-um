import { CreatorEditorMapStatus } from '../enums/creator-editor-map-status.enum';

export class ICreatorEditorMap {
  id: string;
  creatorId: string;
  editorId: string;
  status: CreatorEditorMapStatus;
  createdAt: Date;
  updatedAt: Date;
}
