// Car Rentals Schema
// Defines the Mongoose schema for car rentals, including all necessary fields and their types.
// src\car-rentals\schema\car-rentals.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auth } from '../../auth/schema/auth-schema';
import { isValidEmail, isValidPhone } from '../../common/utils/validators';

@Schema({ timestamps: true })
export class UserCarForm extends Document {
  @Prop({ type: Types.ObjectId, ref: Auth.name })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  bookingCategory!: string;

  @Prop({ required: true })
  bookingModel!: string;

  @Prop({
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  })
  name!: string;

  @Prop({
    required: [true, 'Email is required'],
    trim: true,
    validate: {
      validator: isValidEmail,
      message: 'Please provide a valid email address',
    },
  })
  email!: string;

  @Prop({
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: isValidPhone,
      message: 'Please provide a valid phone number',
    },
  })
  phoneNumber!: string;

  @Prop({ required: true, trim: true })
  pickupLocation!: string;

  @Prop({ required: true, trim: true })
  dropoffLocation!: string;

  @Prop({ required: true })
  pickupDate!: Date;

  @Prop({ required: false, trim: true })
  pickupTime?: string;

  @Prop({ required: true })
  dropoffDate!: Date;

  @Prop({ required: false, trim: true })
  notes!: string;

  @Prop({ required: false, trim: true })
  rentalDuration?: string;

  @Prop({ required: false, trim: true })
  subModel?: string;

  @Prop({ required: false, trim: true })
  price?: string;
}

export const CarRentalsSchema = SchemaFactory.createForClass(UserCarForm);
