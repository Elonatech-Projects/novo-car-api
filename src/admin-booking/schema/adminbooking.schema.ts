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

  @Prop({ required: true })
  pickupDate: string;

  @Prop({ required: true })
  price: string;

  @Prop({
    required: true,
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
}

export const AdminBookingSchema = SchemaFactory.createForClass(AdminBooking);
