import { AccountEditorMapStatus } from '../enums/account-editor-map-status.enum';

export class IAccountEditorMap {
  id: string;
  accountId: string;
  editorId: string;
  status: AccountEditorMapStatus;
  createdAt: Date;
  updatedAt: Date;
}
