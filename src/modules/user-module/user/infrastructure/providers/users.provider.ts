import { User } from '../entities/user.entity';
import { UserPreferences } from '../entities/user-preferences.entity';
import { DataSource } from 'typeorm';
import {
  USER_PREFERENCES_REPOSITORY,
  USER_REPOSITORY,
} from 'src/utils/services/constants';

export const usersProvider = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DataSource],
  },
  {
    provide: USER_PREFERENCES_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserPreferences),
    inject: [DataSource],
  },
];
