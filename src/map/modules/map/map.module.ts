import { Module } from '@nestjs/common';
import { MapService } from './application/services/map.service';
import { MapController } from './presentation/controllers/map.controller';
import { IMapPort } from './domain/ports/map.port';
import { MapRepositoryAdapter } from './infrastructure/adapters/map.repository';

@Module({
  imports: [],
  controllers: [MapController],
  providers: [
    MapService,
    {
      provide: IMapPort,
      useClass: MapRepositoryAdapter,
    },
  ],
})
export class MapModule {}
