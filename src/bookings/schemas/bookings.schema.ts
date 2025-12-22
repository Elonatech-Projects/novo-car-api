import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { BookingPayment } from '../types/payment.type';
export type BookingDocument = Bookings & Document;

@Schema({ timestamps: true })
// export class Bookings {
//   @Prop({ required: true })
//   shuttleType: string;

//   @Prop({ required: true })
//   pickupLocation: string;

//   @Prop({ required: true })
//   dropoffLocation: string;

//   @Prop({ required: true })
//   bookingDate: string;

//   @Prop({ required: true })
//   pickupTime: string;

//   @Prop({ required: true, default: 1 })
//   numberOfPassengers: number;

//   @Prop({ required: true })
//   firstName: string;

//   @Prop({ required: true })
//   lastName: string;

//   @Prop({ required: true })
//   email: string;

//   @Prop({ required: true })
//   phoneNumber: string;

//   // Optional fields
//   @Prop()
//   airport?: string;

//   @Prop()
//   flightNumber?: string;

//   @Prop()
//   terminal?: string;

//   @Prop()
//   specialRequests?: string;

//   @Prop()
//   weddingVenue?: string;

//   @Prop()
//   weddingDate?: string;

//   @Prop()
//   numberOfCars?: number;

//   @Prop()
//   tourPackage?: string;

//   @Prop()
//   tourDuration?: number;

//   @Prop()
//   accommodationType?: string;

//   // System fields
//   @Prop()
//   userId?: string;

//   @Prop({ required: true, unique: true })
//   bookingReference: string;

//   @Prop({
//     required: true,
//     enum: ['pending', 'confirmed', 'completed', 'cancelled'],
//     default: 'pending',
//   })
//   status: string;

//   @Prop({ type: Object })
//   payment?: {
//     method: string;
//     reference?: string;
//     amount: number;
//     status: string;
//     verified: boolean;
//     paystackReference?: string;
//     verifiedAt?: Date;
//   };

//   @Prop({ default: Date.now })
//   createdAt: Date;

//   @Prop({ default: Date.now })
//   updatedAt: Date;
// }
@Schema({ timestamps: true })
export class Bookings {
  @Prop({ required: true })
  shuttleType: string;

  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true })
  dropoffLocation: string;

  @Prop({ required: true })
  bookingDate: string; // ISO string recommended

  @Prop({ required: true })
  pickupTime: string;

  @Prop({ required: true, default: 1 })
  numberOfPassengers: number;

  // Guest details (optional when logged in)
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  email?: string;

  @Prop()
  phoneNumber?: string;

  // Shuttle specific
  @Prop() airport?: string;
  @Prop() flightNumber?: string;
  @Prop() terminal?: string;
  @Prop() specialRequests?: string;

  @Prop() weddingVenue?: string;
  @Prop() weddingDate?: string;
  @Prop() numberOfCars?: number;

  @Prop() tourPackage?: string;
  @Prop() tourDuration?: number;
  @Prop() accommodationType?: string;

  // System
  @Prop({ index: true })
  userId?: string;

  @Prop({ required: true, unique: true, index: true })
  bookingReference: string;

  @Prop({
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  @Prop({ type: Object })
  payment?: BookingPayment;
}

export const BookingSchema = SchemaFactory.createForClass(Bookings);
