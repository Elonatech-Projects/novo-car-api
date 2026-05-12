// src/fleet-management/schema/fleet-management.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { isValidEmail, isValidPhone } from '../../common/utils/validators';

export type FleetManagementDocument = HydratedDocument<FleetManagement>;

@Schema({ timestamps: true })
export class FleetManagement {
  @Prop({
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  })
  name!: string;

  @Prop({
    required: [true, 'Email is required'],
    lowercase: true,
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
  phone!: string;

  @Prop({
    required: [true, 'Pickup location is required'],
    trim: true,
  })
  pickup!: string;

  @Prop({
    required: [true, 'Destination is required'],
    trim: true,
  })
  destination!: string;

  @Prop({
    required: [true, 'Date is required'],
  })
  date!: string;

  @Prop({
    required: [true, 'Time is required'],
  })
  time!: string;

  @Prop({
    required: [true, 'Passenger count is required'],
  })
  passengerCount!: string;

  @Prop({
    trim: true,
    maxlength: [300, 'Cargo description too long'],
  })
  cargoDescription?: string;

  @Prop({
    trim: true,
    maxlength: [300, 'Special requests too long'],
  })
  specialRequests?: string;

  @Prop({
    trim: true,
  })
  vehicleType?: string;

  @Prop()
  vehicleId?: number;

  @Prop({
    trim: true,
  })
  vehicleName?: string;
}

export const FleetManagementSchema =
  SchemaFactory.createForClass(FleetManagement);

// Helpful index for admin queries
FleetManagementSchema.index({ createdAt: -1 });
FleetManagementSchema.index({ email: 1 });
FleetManagementSchema.index({ phone: 1 });
