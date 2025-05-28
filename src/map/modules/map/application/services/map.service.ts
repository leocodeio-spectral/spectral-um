import { Injectable } from '@nestjs/common';

// creator editor
import { ICreatorEditorMap } from '../../domain/models/creator-editor-map.model';
import { ICreatorEditorMapPort } from '../../domain/ports/creator-editor-map.port';

// account editor
import { IAccountEditorMap } from '../../domain/models/account-editor-map.model';
import { IAccountEditorMapPort } from '../../domain/ports/account-editor-map.port';
import { CreatorEditorFindDto } from '../dtos/find-creator-editor.dto';

@Injectable()
export class CreatorEditorMapService {
  constructor(private readonly creatorEditorMapPort: ICreatorEditorMapPort) {}

  findAll(): Promise<ICreatorEditorMap[]> {
    return this.creatorEditorMapPort.findAll();
  }

  findById(id: string): Promise<ICreatorEditorMap | null> {
    return this.creatorEditorMapPort.findById(id);
  }

  //
  findMap(
    creatorId: string,
    editorMail: string,
  ): Promise<CreatorEditorFindDto | null> {
    return this.creatorEditorMapPort.findByCreatorIdAndEditorId(
      creatorId,
      editorMail,
    );
  }

  //
  findMapsByCreatorId(creatorId: string): Promise<ICreatorEditorMap[]> {
    return this.creatorEditorMapPort.findMapsByCreatorId(creatorId);
  }

  //
  requestEditor(
    creatorId: string,
    editorId: string,
  ): Promise<ICreatorEditorMap> {
    return this.creatorEditorMapPort.requestEditor(creatorId, editorId);
  }

  create(
    creatorEditorMap: Partial<ICreatorEditorMap>,
  ): Promise<ICreatorEditorMap> {
    return this.creatorEditorMapPort.save(creatorEditorMap);
  }

  update(
    id: string,
    creatorEditorMap: Partial<ICreatorEditorMap>,
  ): Promise<ICreatorEditorMap | null> {
    return this.creatorEditorMapPort.update(id, creatorEditorMap);
  }

  delete(id: string): Promise<void> {
    return this.creatorEditorMapPort.delete(id);
  }
}

@Injectable()
export class AccountEditorMapService {
  constructor(private readonly accountEditorMapPort: IAccountEditorMapPort) {}

  findAll(): Promise<IAccountEditorMap[]> {
    return this.accountEditorMapPort.findAll();
  }

  findById(id: string): Promise<IAccountEditorMap | null> {
    return this.accountEditorMapPort.findById(id);
  }

  create(
    accountEditorMap: Partial<IAccountEditorMap>,
  ): Promise<IAccountEditorMap> {
    return this.accountEditorMapPort.save(accountEditorMap);
  }

  update(
    id: string,
    accountEditorMap: Partial<IAccountEditorMap>,
  ): Promise<IAccountEditorMap | null> {
    return this.accountEditorMapPort.update(id, accountEditorMap);
  }

  delete(id: string): Promise<void> {
    return this.accountEditorMapPort.delete(id);
  }
}
