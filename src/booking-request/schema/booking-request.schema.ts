// schema/booking-request.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type BookingRequestDocument = HydratedDocument<BookingRequest>;

export type BookingRequestStatus =
  | 'pending_review'
  | 'contacted'
  | 'converted'
  | 'rejected';

@Schema({ timestamps: true })
export class BookingRequest {
  @Prop({ required: true })
  shuttleType: string;

  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true })
  dropoffLocation: string;

  @Prop({ required: true })
  bookingDate: string;

  @Prop({ required: true })
  pickupTime: string;

  @Prop({ default: 1 })
  numberOfPassengers: number;

  @Prop({ required: false, trim: true })
  specialRequests?: string;

  @Prop({ required: false, trim: true })
  vehicleType?: string;

  // User Info
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  // Optional fields
  @Prop({ required: false, trim: true })
  airport?: string;

  @Prop({ required: false, trim: true })
  flightNumber?: string;

  @Prop({ required: false, trim: true })
  terminal?: string;

  @Prop({ required: false, trim: true })
  weddingVenue?: string;

  @Prop({ required: false, trim: true })
  weddingDate?: string;

  @Prop({ required: false, trim: true })
  numberOfCars?: number;

  @Prop({ required: false, trim: true })
  weddingPackage?: string;

  @Prop({ required: false, trim: true })
  tourPackage?: string;

  @Prop({ required: false, trim: true })
  tourDuration?: number;

  @Prop({ required: false, trim: true })
  accommodationType?: string;

  // Tracking
  @Prop({ default: 'pending_review' })
  status: BookingRequestStatus;

  @Prop({ default: 'booking-page' })
  source: string;
}

export const BookingRequestSchema =
  SchemaFactory.createForClass(BookingRequest);
