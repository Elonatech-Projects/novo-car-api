// trips/schema/trip.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShuttleType =
  | 'Work Shuttle'
  | 'Airport Shuttle'
  | 'School Shuttle'
  | 'Event Shuttle'
  | 'Luxury Shuttle'
  | 'Standard Shuttle';

export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type TripDocument = Trip & Document;

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true, unique: true })
  routeCode: string; // e.g., "LAG-ABJ-001"

  @Prop({ required: true })
  pickupLocation: string; // City name or specific location

  @Prop({ required: true })
  dropoffLocation: string;

  @Prop({
    enum: [
      'Work Shuttle',
      'Airport Shuttle',
      'School Shuttle',
      'Event Shuttle',
      'Luxury Shuttle',
      'Standard Shuttle',
    ],
    required: true,
  })
  shuttleType: ShuttleType;

  @Prop({ required: true })
  vehicleType: string; // e.g., "18-Seater Bus", "14-Seater Bus"

  @Prop({ required: true, min: 1 })
  capacity: number; // Maximum passengers

  @Prop({ required: true, min: 0 })
  basePrice: number; // Price per person

  @Prop({ required: true })
  departureTime: string; // e.g., "08:00" (24-hour format)

  @Prop({ required: true })
  arrivalTime: string; // e.g., "14:00"

  @Prop({ required: true })
  duration: string; // e.g., "6 hours", "6h 30m"

  @Prop({
    type: [String],
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    required: true,
  })
  operatingDays: WeekDay[];

  @Prop({ type: [String], default: [] })
  amenities: string[]; // e.g., ["AC", "WiFi", "Refreshments"]

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isAvailable: boolean;

  // Optional: For specific date-based trips
  @Prop({ type: [String], default: [] })
  specificDates: string[]; // e.g., ["2024-12-25", "2024-12-26"]

  // Availability tracking (could be real-time)
  // @Prop({
  //   type: Map,
  //   of: Number,
  //   default: {},
  // })
  // availability: Map<string, number>; // date -> availableSeats
}

export const TripSchema = SchemaFactory.createForClass(Trip);

// Create index for search optimization
TripSchema.index({ pickupLocation: 1, dropoffLocation: 1 });
TripSchema.index({ operatingDays: 1 });
TripSchema.index({ isAvailable: 1 });
