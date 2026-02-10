// src/maps/maps.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from '@googlemaps/google-maps-services-js';

import { DistanceCache, DistanceCacheDocument } from './maps.schema';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private client = new Client({});

  constructor(
    @InjectModel(DistanceCache.name)
    private readonly cacheModel: Model<DistanceCacheDocument>,
  ) {}

  async getDistanceKm(origin: string, destination: string): Promise<number> {
    // 🧠 DEV / SAFETY FALLBACK
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      this.logger.warn(
        '[MapsService] GOOGLE_MAPS_API_KEY missing — using fallback distance (10km)',
      );
      return 10; // safe dev default
    }

    // 1️⃣ Check cache
    const cached = await this.cacheModel.findOne({ origin, destination });
    if (cached) {
      return cached.distanceKm;
    }

    // 2️⃣ Call Google Maps
    const response = await this.client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    const element = response.data.rows[0]?.elements[0];

    if (!element || String(element.status) !== 'OK') {
      this.logger.error(
        `[MapsService] Google Maps failed for ${origin} → ${destination}`,
      );
      throw new Error('Unable to calculate distance');
    }

    const distanceKm = element.distance.value / 1000;

    // 3️⃣ Cache result
    await this.cacheModel.create({
      origin,
      destination,
      distanceKm,
    });

    return distanceKm;
  }
}
