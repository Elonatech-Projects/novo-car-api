// src\od-school\schema\od-school.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { randomUUID } from 'crypto';

export type ODSchoolDocument = ODSchool & Document;

@Schema({
  timestamps: true,
})
export class ODSchool extends Document {
  @Prop({
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  })
  name!: string;

  @Prop({
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  })
  email!: string;

  @Prop({
    required: [true, 'Phone number is required'],
    trim: true,
  })
  phone!: string;

  @Prop({
    required: [true, 'Package selection is required'],
    trim: true,
  })
  packageId!: string;

  @Prop({
    required: [true, 'Preferred date is required'],
    trim: true,
  })
  preferredDate!: string;

  @Prop({
    required: [true, 'Preferred time is required'],
    trim: true,
  })
  preferredTime!: string;

  @Prop({
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    default: '',
  })
  message!: string;

  @Prop({
    required: [true, 'You must agree to terms'],
    default: false,
  })
  agreeToTerms!: boolean;

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({
    type: String,
    default: () => randomUUID(),
    unique: true,
  })
  bookingReference!: string;

  @Prop({ type: String, required: false })
  ipAddress?: string;

  @Prop({ type: Date, default: null })
  emailSentAt?: Date;

  @Prop({ type: Number, default: 0 })
  emailRetryCount!: number;
}

export const ODSchoolSchema = SchemaFactory.createForClass(ODSchool);

// Compound index for duplicate detection (active bookings only)
ODSchoolSchema.index(
  {
    email: 1,
    preferredDate: 1,
    preferredTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isArchived: false },
    name: 'unique_active_booking_per_slot',
  },
);

// Index for phone lookups
ODSchoolSchema.index(
  { phone: 1, preferredDate: 1, preferredTime: 1 },
  {
    unique: true,
    partialFilterExpression: { isArchived: false },
    name: 'unique_phone_booking_per_slot',
  },
);

// Index for admin queries
ODSchoolSchema.index({ createdAt: -1 });
ODSchoolSchema.index({ packageId: 1, createdAt: -1 });
ODSchoolSchema.index({ bookingReference: 1 }, { unique: true });

// Add virtual for booking status
ODSchoolSchema.virtual('status').get(function (this: ODSchoolDocument) {
  if (this.isArchived) return 'cancelled';
  if (this.emailSentAt) return 'confirmed';
  return 'pending';
});
