// src/maps/schema/distance-cache.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DistanceCache {
  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  distanceKm: number;
}

export type DistanceCacheDocument = DistanceCache & Document;
export const DistanceCacheSchema = SchemaFactory.createForClass(DistanceCache);
