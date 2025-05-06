import { IUserPreferences } from '../models/user-preferences.model';

export abstract class IUserPreferencesPort {
  abstract findByUserId(userId: string): Promise<IUserPreferences | null>;
  abstract save(
    IUserPreferences: Partial<IUserPreferences>,
  ): Promise<IUserPreferences>;
  abstract update(
    id: string,
    IUserPreferences: Partial<IUserPreferences>,
  ): Promise<IUserPreferences>;
}
