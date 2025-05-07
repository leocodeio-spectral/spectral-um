import { ICreatorPreferences, IEditorPreferences } from '../models/user-preferences.model';

export abstract class ICreatorPreferencesPort {
  abstract findByUserId(userId: string): Promise<ICreatorPreferences | null>;
  abstract save(
    ICreatorPreferences: Partial<ICreatorPreferences>,
  ): Promise<ICreatorPreferences>;
  abstract update(
    id: string,
    ICreatorPreferences: Partial<ICreatorPreferences>,
  ): Promise<ICreatorPreferences>;
}

export abstract class IEditorPreferencesPort {
  abstract findByUserId(userId: string): Promise<IEditorPreferences | null>;
  abstract save(
    IEditorPreferences: Partial<IEditorPreferences>,
  ): Promise<IEditorPreferences>;
  abstract update(
    id: string,
    IEditorPreferences: Partial<IEditorPreferences>,
  ): Promise<IEditorPreferences>;
}
