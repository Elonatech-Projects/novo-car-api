// src/paystack-bookings/schemas/paystack-bookings.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { BookingPayment } from '../types/payment.type';

export type PaystackBookingsDocument = PaystackBookings & Document;

@Schema({ timestamps: true, collection: 'new_paystack_bookings' })
export class PaystackBookings {
  @Prop({ required: true }) shuttleType: string;
  @Prop({ required: true }) pickupLocation: string;
  @Prop({ required: true }) dropoffLocation: string;
  @Prop({ required: true }) bookingDate: string;
  @Prop({ required: true }) pickupTime: string;
  @Prop({ required: true, default: 1 }) numberOfPassengers: number;

  // Guest
  @Prop() firstName?: string;
  @Prop() lastName?: string;
  @Prop() email?: string;
  @Prop() phoneNumber?: string;

  // Shuttle
  @Prop() airport?: string;
  @Prop() flightNumber?: string;
  @Prop() terminal?: string;
  @Prop() specialRequests?: string;

  @Prop() weddingVenue?: string;
  @Prop() weddingDate?: string;
  @Prop() numberOfCars?: number;
  @Prop() tourPackage?: string;
  @Prop() tourDuration?: number;
  @Prop() accommodationType?: string;

  // System
  @Prop({ index: true }) userId?: string;
  @Prop({ required: true, unique: true }) bookingReference: string;
  @Prop({
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;
  @Prop({ type: Object }) payment?: BookingPayment;
}

export const PaystackBookingSchema =
  SchemaFactory.createForClass(PaystackBookings);
