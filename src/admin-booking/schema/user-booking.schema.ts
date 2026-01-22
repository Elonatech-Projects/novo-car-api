import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AdminBooking } from './adminbooking.schema';

export type UserBookingDocument = UserBooking & Document;

@Schema({ timestamps: true })
export class UserBooking {
  @Prop({ type: Types.ObjectId, ref: AdminBooking.name, required: true })
  tripId: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 'PENDING_PAYMENT' })
  status: 'PENDING_PAYMENT' | 'PAID' | 'FAILED';

  @Prop()
  paymentReference?: string;

  @Prop()
  paidAt?: Date;

  // @Prop({ required: true })
  // userId: string;

  // @Prop({ required: true })
  // passengers: number;

  // @Prop({ required: true })
  // shuttleType: string;

  // @Prop({ required: true })
  // pickupTime: string;

  // @Prop({ required: true })
  // pickupDate: string;

  // @Prop({ required: true })
  // pickupLocation: string;

  // @Prop({ required: true })
  // dropoffLocation: string;
}

export const UserBookingSchema = SchemaFactory.createForClass(UserBooking);
