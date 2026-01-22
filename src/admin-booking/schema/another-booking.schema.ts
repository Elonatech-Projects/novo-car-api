import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { AdminBooking } from './adminbooking.schema';

export type AnotherBookingDocument = AnotherBooking & Document;

@Schema({ timestamps: true })
export class AnotherBooking {
  @Prop({ type: Types.ObjectId, ref: 'AdminBooking', required: true })
  tripId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string; // REQUIRED FOR PAYSTACK

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, type: Number })
  price: number; // REQUIRED FOR PAYSTACK

  @Prop({
    default: 'PENDING_PAYMENT',
    enum: ['PENDING_PAYMENT', 'PAID', 'FAILED'],
  })
  status: 'PENDING_PAYMENT' | 'PAID' | 'FAILED';

  @Prop()
  paymentReference?: string;

  @Prop()
  paidAt?: Date;
}

export const AnotherBookingSchema =
  SchemaFactory.createForClass(AnotherBooking);
