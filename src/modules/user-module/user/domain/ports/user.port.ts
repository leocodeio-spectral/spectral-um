import { IUser } from '../models/user.model';

export abstract class IUserPort {
  abstract findById(id: string): Promise<IUser | null>;
  abstract findByIdentifier(identifier: string): Promise<IUser | null>;
  abstract save(user: Partial<IUser>): Promise<IUser>;
  abstract update(id: string, user: Partial<IUser>): Promise<IUser>;
}
