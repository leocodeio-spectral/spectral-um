import { DataSource } from 'typeorm';
import { SESSION_REPOSITORY } from 'src/auth/libs/services/constants';
import { Session } from '../entities/session.entity';

export const sessionProvider = [
  {
    provide: SESSION_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Session),
    inject: [DataSource],
  },
];
