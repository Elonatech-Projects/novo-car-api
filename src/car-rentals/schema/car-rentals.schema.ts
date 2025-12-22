import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auth } from '../../auth/schema/auth-schema';

@Schema({ timestamps: true })
export class UserCarForm extends Document {
  @Prop({ type: Types.ObjectId, ref: Auth.name })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  bookingCategory: string;

  @Prop({ required: true })
  bookingModel: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  pickupDate: Date;

  @Prop({ required: true })
  dropoffDate: Date;

  @Prop({ required: true })
  notes: string;

  @Prop()
  subModel?: string;

  @Prop()
  price?: string;
}

export const CarRentalsSchema = SchemaFactory.createForClass(UserCarForm);
