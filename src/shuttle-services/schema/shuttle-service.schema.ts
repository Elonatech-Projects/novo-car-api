import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import type { ShuttleTripType } from '../../common/enums/shuttle-booking.enum';
import { ShuttleBookingStatus } from '../../common/enums/shuttle-booking.enum';
import { Auth } from '../../auth/schema/auth-schema';

export type ShuttleDocument = Shuttle & Document;

@Schema({ timestamps: true })
export class Shuttle {
  @Prop({ type: Types.ObjectId, ref: 'Schedule', required: true })
  scheduleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Auth.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  travelDate: string; // YYYY-MM-DD

  @Prop({ required: true, min: 1 })
  seatCount: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    type: String,
    enum: ShuttleBookingStatus,
    default: ShuttleBookingStatus.RESERVED,
  })
  status: ShuttleBookingStatus;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: false })
  paidAt?: Date;

  @Prop({ unique: true, sparse: true })
  paymentReference?: string;

  @Prop({ default: false })
  paymentVerified: boolean;
}

export const ShuttleServicesSchema = SchemaFactory.createForClass(Shuttle);

ShuttleServicesSchema.index({ scheduleId: 1, travelDate: 1 });
// Index to automatically expire documents after 'expiresAt' date
ShuttleServicesSchema.index({ expiresAt: 1 });

ShuttleServicesSchema.index({ status: 1, expiresAt: 1 });

// Index to quickly find bookings by payment reference
ShuttleServicesSchema.index({ paymentReference: 1 });
