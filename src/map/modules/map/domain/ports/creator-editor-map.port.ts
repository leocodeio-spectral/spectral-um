import { ICreatorEditorMap } from '../models/creator-editor-map.model';

export abstract class ICreatorEditorMapPort {
  abstract findAll(): Promise<ICreatorEditorMap[]>;
  abstract findById(id: string): Promise<ICreatorEditorMap | null>;
  abstract findByCreatorId(creatorId: string): Promise<ICreatorEditorMap[]>;
  abstract findByEditorId(editorId: string): Promise<ICreatorEditorMap[]>;
  abstract save(map: Partial<ICreatorEditorMap>): Promise<ICreatorEditorMap>;
  abstract update(
    id: string,
    map: Partial<ICreatorEditorMap>,
  ): Promise<ICreatorEditorMap | null>;
  abstract delete(id: string): Promise<void>;
}
