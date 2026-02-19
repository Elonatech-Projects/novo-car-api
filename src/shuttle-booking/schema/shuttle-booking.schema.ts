// Shuttle-booking Schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ShuttleType } from '../enums';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Schema({ timestamps: true })
export class ShuttleBooking {
  /* Core */
  @Prop({ required: true, enum: ShuttleType })
  shuttleType: ShuttleType;

  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true })
  dropoffLocation: string;

  @Prop({ required: true })
  bookingDate: string;

  @Prop({ required: true })
  pickupTime: string;

  @Prop({ required: true, min: 1 })
  numberOfPassengers: number;

  @Prop()
  specialRequests?: string;

  @Prop()
  pickupLat?: number;

  @Prop()
  pickupLng?: number;

  @Prop()
  dropoffLat?: number;

  @Prop()
  dropoffLng?: number;

  /* User */
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  email?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ index: true })
  userId?: string;

  /* Airport */
  @Prop()
  airport?: string;

  @Prop()
  flightNumber?: string;

  @Prop()
  terminal?: string;

  /* Wedding */
  @Prop()
  weddingVenue?: string;

  @Prop()
  weddingDate?: string;

  @Prop()
  numberOfCars?: number;

  /* Tour */
  @Prop()
  tourPackage?: string;

  @Prop()
  tourDuration?: number;

  @Prop()
  accommodationType?: string;

  /* Payment */
  @Prop({ required: true })
  totalPrice: number;

  @Prop({
    type: {
      method: String,
      reference: String,
      amount: Number,
      status: String,
      verified: Boolean,
    },
  })
  payment?: {
    method: string;
    reference?: string;
    amount: number;
    status: string;
    verified: boolean;
  };

  @Prop({
    required: true,
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  @Prop({ unique: true })
  bookingReference: string;

  /* Payment */
  @Prop()
  paymentReference?: string;

  @Prop()
  paidAt?: Date;

  // Immutable stored pricing at booking time
  @Prop({
    type: {
      baseFare: Number,
      serviceCharge: Number,
      vat: Number,
      total: Number,
    },
  })
  pricingSnapshot?: {
    baseFare: number;
    serviceCharge: number;
    vat: number;
    total: number;
  };

  // Calculate live pricing
  @Prop({ type: Object })
  pricingBreakdown: {
    baseFare: number;
    serviceCharge: number;
    vat: number;
    surgeMultiplier?: number;
  };

  @Prop()
  distanceKm?: number;

  @Prop({ default: false, type: Boolean })
  refundFinalized?: boolean;

  @Prop({
    type: [
      {
        _id: false,
        status: { type: String, enum: BookingStatus, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  statusHistory: { status: BookingStatus; changedAt: Date }[];
}

export type ShuttleBookingDocument = ShuttleBooking & Document;
export const ShuttleBookingSchema =
  SchemaFactory.createForClass(ShuttleBooking);

ShuttleBookingSchema.index({ paymentReference: 1 });
ShuttleBookingSchema.index({ bookingReference: 1 });
ShuttleBookingSchema.index({ status: 1 });
