import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreatorModule } from './modules/creator/creator.module';
import { LoggingModule } from './utils/logging/logging.module';
import { ResponseService } from './common/services/response.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'postgres',
      schema: process.env.DB_SCHEMA || 'spectra',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    LoggingModule,
    CreatorModule,
  ],
  controllers: [AppController],
  providers: [AppService, ResponseService],
  exports: [ResponseService],
})
export class AppModule {}
