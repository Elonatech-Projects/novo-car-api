// src/maps/maps.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from '@googlemaps/google-maps-services-js';

import { DistanceCache, DistanceCacheDocument } from './maps.schema';

@Injectable()
export class MapsService {
  private client = new Client({});

  constructor(
    @InjectModel(DistanceCache.name)
    private readonly cacheModel: Model<DistanceCacheDocument>,
  ) {}

  async getDistanceKm(origin: string, destination: string): Promise<number> {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
    this.logger.warn(
        '[MapsService] GOOGLE_MAPS_API_KEY missing — using fallback distance (10km)',
      );
      return 10; // 👈 safe dev default
    }
    const cached = await this.cacheModel.findOne({ origin, destination });
    if (cached) {
      return cached.distanceKm;
    }

    const response = await this.client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    const element = response.data.rows[0]?.elements[0];

    if (!element || String(element.status) !== 'OK') {
      throw new Error('Unable to calculate distance');
    }

    const distanceKm = element.distance.value / 1000;

    await this.cacheModel.create({
      origin,
      destination,
      distanceKm,
    });

    return distanceKm;
  }
}
