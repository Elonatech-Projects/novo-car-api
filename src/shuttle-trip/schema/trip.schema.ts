import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TripDocument = ShuttleTrip & Document;

export type TripType = 'one-way' | 'round-trip';

@Schema({ timestamps: true, collection: 'shuttle_trips' })
export class ShuttleTrip {
  @Prop({ required: false })
  from: string;

  @Prop({ required: false })
  to: string;

  @Prop({ required: false })
  departureDate: string; // store as ISO string

  @Prop()
  returnDate?: string;

  @Prop()
  price?: number;

  @Prop({ required: false, enum: ['one-way', 'round-trip'] })
  tripType?: TripType;
}

export const TripSchema = SchemaFactory.createForClass(ShuttleTrip);
