import { ICreator,IEditor } from '../models/user.model';

export abstract class ICreatorPort {
  abstract findById(id: string): Promise<ICreator | null>;
  abstract findByIdentifier(identifier: string): Promise<ICreator | null>;
  abstract save(user: Partial<ICreator>): Promise<ICreator>;
  abstract update(id: string, user: Partial<ICreator>): Promise<ICreator>;
}

export abstract class IEditorPort {
  abstract findById(id: string): Promise<IEditor | null>;
  abstract findByIdentifier(identifier: string): Promise<IEditor | null>;
  abstract save(user: Partial<IEditor>): Promise<IEditor>;
  abstract update(id: string, user: Partial<IEditor>): Promise<IEditor>;
}
