import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GuestBooking extends Document {
  // Guest info
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  nextOfKinName: string;

  @Prop({ required: true })
  nextOfKinPhone: string;

  // Trip snapshot
  @Prop({ required: true })
  tripId: string;

  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true })
  dropoffLocation: string;

  @Prop({ required: true })
  pickupDate: string;

  @Prop({ required: true })
  shuttleType: string;

  @Prop({ required: true })
  price: number;

  // Status (important for ops)
  @Prop({ default: 'pending' })
  status: 'pending' | 'paid' | 'cancelled';

  @Prop()
  reference: string;

  @Prop()
  paidAt?: Date;
}

export const GuestBookingSchema = SchemaFactory.createForClass(GuestBooking);
