import { ICreatorEditorMap } from '../models/creator-editor-map.model';
import { CreatorEditorFindDto } from '../../application/dtos/find-creator-editor.dto';

export abstract class ICreatorEditorMapPort {
  abstract findAll(): Promise<ICreatorEditorMap[]>;
  abstract findById(id: string): Promise<ICreatorEditorMap | null>;
  abstract findMapsByCreatorId(creatorId: string): Promise<ICreatorEditorMap[]>;
  abstract findByEditorId(editorId: string): Promise<ICreatorEditorMap[]>;
  abstract findByCreatorIdAndEditorId(
    creatorId: string,
    editorMail: string,
  ): Promise<CreatorEditorFindDto | null>;
  abstract requestEditor(
    creatorId: string,
    editorId: string,
  ): Promise<ICreatorEditorMap>;
  abstract save(map: Partial<ICreatorEditorMap>): Promise<ICreatorEditorMap>;
  abstract update(
    id: string,
    map: Partial<ICreatorEditorMap>,
  ): Promise<ICreatorEditorMap | null>;
  abstract delete(id: string): Promise<void>;
}
