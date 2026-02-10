// user-booking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BookingStatus } from '../../common/enums/booking-status.enum';

export type UserBookingDocument = UserBooking & Document;

@Schema({ timestamps: true, collection: 'user_bookings' })
export class UserBooking {
  @Prop({ type: Types.ObjectId, ref: 'Trip', required: true })
  tripId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  passengers: number;

  @Prop({ required: true })
  travelDate: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    // type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  @Prop()
  paymentReference?: string;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop()
  nextOfKinName?: string;

  @Prop()
  nextOfKinPhone?: string;

  @Prop()
  pickupTime?: string;

  @Prop({ default: false, type: Boolean })
  refundFinalized?: boolean;
}

export const UserBookingSchema = SchemaFactory.createForClass(UserBooking);

UserBookingSchema.index({ tripId: 1, travelDate: 1 });
