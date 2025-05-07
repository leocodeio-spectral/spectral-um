import { Creator, Editor } from '../entities/user.entity';
import {
  CreatorPreferences,
  EditorPreferences,
} from '../entities/user-preferences.entity';
import { DataSource } from 'typeorm';
import {
  CREATOR_PREFERENCES_REPOSITORY,
  CREATOR_REPOSITORY,
  EDITOR_PREFERENCES_REPOSITORY,
  EDITOR_REPOSITORY,
} from 'src/utils/services/constants';

export const creatorsProvider = [
  {
    provide: CREATOR_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Creator),
    inject: [DataSource],
  },
  {
    provide: CREATOR_PREFERENCES_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CreatorPreferences),
    inject: [DataSource],
  },
];

export const editorsProvider = [
  {
    provide: EDITOR_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Editor),
    inject: [DataSource],
  },
  {
    provide: EDITOR_PREFERENCES_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EditorPreferences),
    inject: [DataSource],
  },
];
