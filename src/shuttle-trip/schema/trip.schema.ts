import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TripDocument = Trip & Document;

export type TripType = 'one-way' | 'round-trip';

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  departureDate: string; // store as ISO string

  @Prop()
  returnDate?: string;

  @Prop()
  price?: number;

  @Prop({ required: true, enum: ['one-way', 'round-trip'] })
  tripType?: TripType;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
