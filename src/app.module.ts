import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '@leocodeio-njs/njs-config';
import {
  LogEntry,
  LoggerService,
  LoggingInterceptor,
  LoggingModule,
  PerformanceInterceptor,
  ResponseInterceptor,
} from '@leocodeio-njs/njs-logging';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '@leocodeio-njs/njs-config';
import * as Joi from 'joi';

import { HealthModule, PrometheusService } from '@leocodeio-njs/njs-health';

// modules
import {
  CreatorValidationModule,
  EditorValidationModule,
} from './auth/modules/validation/validation.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  CreatorModule,
  EditorModule,
} from './auth/modules/user/user-auth.module';
import { SessionModule } from './auth/modules/session/session.module';
import {
  CreatorOtpModule,
  EditorOtpModule,
} from './auth/modules/otp/otp.module';
import { S3Module } from './media/libs/s3/s3.module';
import { MediaModule } from './media/modules/media/media.module';
import { YtAuthModule } from './yt_int/modules/youtube/yt-auth.module';
import { YtCreatorModule } from './yt_int/modules/creator/yt-creator.module';
import { MapModule } from './map/modules/map/map.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load environment variables - update with the path to your .env file
      envFilePath: ['.env.local', '.env'],
      // Add social media configuration variables
      validationSchema: Joi.object({
        // Existing validation

        // APP PORT
        PORT: Joi.number().default(3000).required(),

        // DATABASE CONFIGURATION
        DB_HOST: Joi.string().default('localhost').required(),
        DB_USERNAME: Joi.string().default('postgres').required(),
        DB_PASSWORD: Joi.string().default('postgres').required(),
        DB_DATABASE: Joi.string().default('postgres').required(),
        DB_SCHEMA: Joi.string().default('test').required(),
        DB_PORT: Joi.number().default(5432).required(),

        //rate limit
        RATE_LIMIT_POINTS: Joi.number().default(100).required(),
        RATE_LIMIT_DURATION: Joi.number()
          .default(60 * 60)
          .required(), // Per hour
        RATE_LIMIT_BLOCK_DURATION: Joi.number()
          .default(5 * 60)
          .required(), // 5min block if exceeded

        // guards
        // apikey guard
        APP_KEY: Joi.string().default('apikey').required(),
        // acess token guard
        ACCESS_TOKEN_VALIDATION_URL: Joi.string()
          .default('http://localhost:3000/validate')
          .required(),
        AUTHORIZER_API_KEY: Joi.string().default('validkey1').required(),
        CLUSTER_CLIENT_ID: Joi.string().default('validclient1').required(),

        // validation
        ACCESS_TOKEN_SECRET: Joi.string()
          .default('access-token-secret')
          .required(),
        REFRESH_TOKEN_SECRET: Joi.string()
          .default('refresh-token-secret')
          .required(),

        // otp
        MOBILE_VERIFICATION: Joi.boolean().default(false).required(),
        SMS_SERVICE: Joi.string().valid('twilio', 'fast2sms').required(),

        TEST_PHONE_NUMBERS: Joi.string().optional(),

        // email
        EMAIL_FROM: Joi.string().default('noreply@um.com').required(),
        TOPT_SECRET: Joi.string().default('this-is-totp-secret').required(),
        GMAIL_USER: Joi.string().optional().default('gmail-user').required(),
        GMAIL_APP_PASSWORD: Joi.string()
          .optional()
          .default('gmail-user-password')
          .required(),

        // jwt
        // access token
        JWT_SECRET: Joi.string()
          .default('this-is-access-token-secret')
          .required(),
        JWT_EXPIRES_IN: Joi.string().default('30m').required(),

        // refresh token
        JWT_REFRESH_SECRET: Joi.string()
          .default('this-is-refresh-token-secret')
          .required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d').required(),

        // aws
        AWS_REGION: Joi.string().default('us-east-1').required(),
        AWS_ACCESS_KEY_ID: Joi.string().default('test').required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().default('test').required(),
        AWS_S3_BUCKET_NAME: Joi.string().default('my-local-bucket').required(),
        AWS_S3_ENDPOINT: Joi.string()
          .default('http://localhost:4566')
          .required(),
        AWS_S3_FOLDER_NAME: Joi.string().default('media').required(),
      }),
    }),
    AppConfigModule,

    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        ...configService.databaseConfig,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([LogEntry]),
    LoggingModule.forRoot({
      entities: [LogEntry],
      winston: {
        console: true,
        file: {
          enabled: true,
        },
      },
    }),
    // auth
    EditorOtpModule,
    CreatorOtpModule,
    CreatorValidationModule,
    EditorValidationModule,
    HealthModule,
    CreatorModule,
    EditorModule,
    SessionModule,

    // media
    S3Module,
    MediaModule,

    // yt
    YtAuthModule,
    YtCreatorModule,

    // map
    MapModule,
    
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrometheusService,
    LoggerService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: PerformanceInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
