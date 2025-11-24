import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { Auth } from 'src/auth/schema/auth-schema';
import { Auth } from '../../auth/schema/auth-schema';

@Schema({ timestamps: true })
export class Booking extends Document {
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
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
