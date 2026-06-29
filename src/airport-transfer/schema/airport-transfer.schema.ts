// Airport Transfer booking schema
// src/airport-transfer/schema/airport-transfer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AirportTransferDocument = HydratedDocument<AirportTransfer>;

@Schema({ timestamps: true })
export class AirportTransfer {
  // Customer
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  // Trip
  @Prop({ required: true, trim: true })
  airport!: string;

  @Prop({ required: true, trim: true })
  terminal!: string;

  @Prop({ required: true })
  date!: string; // ISO date string

  @Prop({ required: false, trim: true })
  pickupTime?: string;

  @Prop({ required: false, trim: true })
  pickupLocation?: string;

  @Prop({ required: false, trim: true })
  dropoffLocation?: string;

  // Vehicle
  @Prop({ required: true, trim: true })
  vehicle!: string;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: false, trim: true })
  notes?: string;

  // Tracking — admin updates this as they process the booking.
  @Prop({ default: 'pending_review' })
  status!: string;
}

export const AirportTransferSchema =
  SchemaFactory.createForClass(AirportTransfer);

AirportTransferSchema.index({ email: 1, createdAt: -1 });
