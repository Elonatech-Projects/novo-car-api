// Interstate car-rental quote request
// src/interstate-booking/schema/interstate-booking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InterstateBookingDocument = HydratedDocument<InterstateBooking>;

@Schema({ timestamps: true })
export class InterstateBooking {
  // Customer
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  // Trip
  @Prop({ required: true, trim: true })
  pickupLocation!: string;

  @Prop({ required: true, trim: true })
  dropoffLocation!: string;

  @Prop({ required: true })
  date!: string;

  @Prop({ required: false })
  time?: string;

  @Prop({ required: true, default: 1 })
  rentalDays!: number;

  @Prop({ required: true, default: 1 })
  vehicleCount!: number;

  @Prop({ required: true, trim: true })
  vehicleType!: string;

  @Prop({ required: true, default: 1 })
  persons!: number;

  @Prop({ required: false, trim: true })
  notes?: string;

  // Interstate is a quote request — Novo follows up with pricing.
  @Prop({ default: 'pending_review' })
  status!: string;
}

export const InterstateBookingSchema =
  SchemaFactory.createForClass(InterstateBooking);
