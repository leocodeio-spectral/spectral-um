import { IAccountEditorMap } from '../models/account-editor-map.model';

export abstract class IAccountEditorMapPort {
  abstract findAll(): Promise<IAccountEditorMap[]>;
  abstract findById(id: string): Promise<IAccountEditorMap | null>;
  abstract findByAccountId(accountId: string): Promise<IAccountEditorMap[]>;
  abstract findByEditorId(editorId: string): Promise<IAccountEditorMap[]>;
  abstract save(map: Partial<IAccountEditorMap>): Promise<IAccountEditorMap>;
  abstract update(
    id: string,
    map: Partial<IAccountEditorMap>,
  ): Promise<IAccountEditorMap | null>;
  abstract delete(id: string): Promise<void>;
}
