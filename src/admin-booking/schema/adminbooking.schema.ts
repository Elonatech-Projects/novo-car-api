import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Admin } from '../../admin/schema/admin-schema';

export type ShuttleType =
  | 'Work Shuttle'
  | 'Airport Shuttle'
  | 'School Shuttle'
  | 'Event Shuttle'
  | 'Luxury Shuttle'
  | 'Standard Shuttle';

export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

@Schema({ timestamps: true })
export class AdminBooking extends Document {
  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true, ref: Admin.name, type: Types.ObjectId })
  admin: Types.ObjectId; // reference admin

  @Prop({ required: true })
  adminEmail: string; // optional, for display

  @Prop({ required: true })
  dropoffLocation: string;

  @Prop({})
  pickupDate: string;

  @Prop({ required: true })
  price: string;

  @Prop({
    enum: [
      'Work Shuttle',
      'Airport Shuttle',
      'School Shuttle',
      'Event Shuttle',
      'Luxury Shuttle',
      'Standard Shuttle',
    ],
  })
  shuttleType: ShuttleType;

  @Prop({
    type: [String],
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    required: true,
  })
  availableDays: WeekDay[];

  // Payment fields
  @Prop({ default: 'PENDING_PAYMENT' })
  status: 'PENDING_PAYMENT' | 'PAID' | 'FAILED';

  @Prop()
  paymentRef?: string;

  @Prop()
  paidAt?: Date;
}

export const AdminBookingSchema = SchemaFactory.createForClass(AdminBooking);
