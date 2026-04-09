// src\shuttle-services\schema\shuttle-service.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import type { ShuttleTripType } from '../../common/enums/shuttle-booking.enum';
import { ShuttleBookingStatus } from '../../common/enums/shuttle-booking.enum';
import { Auth } from '../../auth/schema/auth-schema';

export type ShuttleDocument = Shuttle & Document;

@Schema({ timestamps: true })
export class Shuttle {
  // TODO: Add tripType (one-way or round-trip) if needed in the future
  @Prop({
    type: {
      outbound: { type: Types.ObjectId, ref: 'Schedule', required: true },
      return: { type: Types.ObjectId, ref: 'Schedule', required: false },
    },
    required: true,
  })
  schedule!: {
    outbound: Types.ObjectId;
    return?: Types.ObjectId;
  };

  // This field can be used in the future to easily filter round-trip bookings without needing to check the return schedule
  @Prop({ default: false })
  isRoundTrip!: boolean;

  @Prop({ type: Types.ObjectId, ref: Auth.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: false })
  returnDate?: string; // YYYY-MM-DD, only required for round-trip bookings

  @Prop({ required: true })
  travelDate!: string; // YYYY-MM-DD

  @Prop({ required: true, min: 1 })
  seatCount!: number;

  @Prop({ required: true })
  totalAmount!: number;

  @Prop({
    type: String,
    enum: ShuttleBookingStatus,
    default: ShuttleBookingStatus.RESERVED,
  })
  status!: ShuttleBookingStatus;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: false })
  paidAt?: Date;

  @Prop({ unique: true, sparse: true })
  paymentReference?: string;

  @Prop({ default: false })
  paymentVerified!: boolean;

  @Prop({
    type: [
      {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        isPrimary: { type: Boolean, required: true, default: false },
      },
    ],
    default: [],
  })
  passengers!: ShuttlePassenger[];
}

export const ShuttleServicesSchema = SchemaFactory.createForClass(Shuttle);

// ShuttleServicesSchema.index({ scheduleId: 1, travelDate: 1 });
ShuttleServicesSchema.index({ 'schedule.outbound': 1, travelDate: 1 });
ShuttleServicesSchema.index({ 'schedule.return': 1, returnDate: 1 });
// Index to automatically expire documents after 'expiresAt' date
// ShuttleServicesSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ShuttleServicesSchema.index({ status: 1, expiresAt: 1 });

export class ShuttlePassenger {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true, default: false })
  isPrimary!: boolean;
}
