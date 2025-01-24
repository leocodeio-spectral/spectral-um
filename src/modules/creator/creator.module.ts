import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Creator } from './infrastructure/entities/creator.entity';
import { CreatorRepository } from './infrastructure/adapters/creator.repository';
import { CreatorService } from './application/services/creator.service';
import { CreatorController } from './presentation/controllers/creator.controller';

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
  controllers: [CreatorController],
  providers: [CreatorService, CreatorRepository],
  exports: [CreatorService, CreatorRepository],
})
export class CreatorModule {}
