import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Creator } from './infrastructure/entities/creator.entity';
import { CreatorRepository } from './infrastructure/adapters/creator.repository';
import { CreatorService } from './application/services/creator.service';
import { CreatorController } from './presentation/controllers/creator.controller';
import { ICreatorRepository } from './domain/ports/creator.repository';
@Module({
  imports: [TypeOrmModule.forFeature([Creator])],
  controllers: [CreatorController],
  providers: [
    CreatorService,
    {
      provide: ICreatorRepository,
      useClass: CreatorRepository,
    },
  ],
})
export class CreatorModule {}
