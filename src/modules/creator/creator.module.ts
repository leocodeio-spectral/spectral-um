import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Creator } from './infrastructure/entities/creator.entity';
import { CreatorRepository } from './infrastructure/adapters/creator.repository';
import { CreatorAuthService } from './application/services/creator-auth.service';
import { CreatorAuthController } from './presentation/controllers/creator-auth.controller';
import { ResponseService } from '../../common/services/response.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Creator]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.getOrThrow('JWT_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [CreatorAuthController],
  providers: [
    CreatorAuthService, 
    CreatorRepository,
    ResponseService,
  ],
  exports: [CreatorAuthService, CreatorRepository],
})
export class CreatorModule {} 