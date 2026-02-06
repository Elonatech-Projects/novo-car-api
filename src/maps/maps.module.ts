// src/maps/maps.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapsService } from './maps.service';
import {
  DistanceCache,
  DistanceCacheSchema,
} from './schema/distance-cache.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DistanceCache.name, schema: DistanceCacheSchema },
    ]),
  ],
  providers: [MapsService],
  exports: [MapsService], // 👈 IMPORTANT
})
export class MapsModule {}
