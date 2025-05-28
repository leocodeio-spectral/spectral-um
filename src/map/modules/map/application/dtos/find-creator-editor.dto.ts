import { CreatorEditorMapStatus } from "../../domain/enums/creator-editor-map-status.enum";

export class CreatorEditorFindDto {
  creatorId: string;
  editorId: string;
  editorMail: string;
  editorName: string;
  editorAvatar: string;
  status: CreatorEditorMapStatus;
}
