import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auth } from '../../auth/schema/auth-schema';

@Schema({ timestamps: true, collection: 'user_bookings' })
export class UserBooking extends Document {
  @Prop({ type: Types.ObjectId, ref: Auth.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true })
  dropoffLocation: string;

  @Prop({ required: true })
  pickupDate: string;

  @Prop({ required: true })
  pickupTime: string;

  @Prop({ required: true })
  shuttleType: string;

  @Prop({ required: true })
  passengers: number;

  // Trip ID
  @Prop({ required: true })
  tripId: string;

  //Status Very Important for Operation
  @Prop({ default: 'pending' })
  status: 'pending' | 'paid' | 'cancelled';
}

export const UserBookingSchema = SchemaFactory.createForClass(UserBooking);
