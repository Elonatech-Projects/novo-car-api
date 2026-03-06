// src/verification-services/schema/verification-services.schema.ts
// Mongoose schema definition for VerificationService
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the Mongoose document type for VerificationService
export type VerificationServiceDocument = VerificationService & Document;

// Define the Mongoose schema for VerificationService
@Schema({ timestamps: true })
export class VerificationService {
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
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
  })
  message!: string;

  @Prop({
    required: [true, 'Company is required'],
    trim: true,
    maxlength: [500, 'Company name cannot exceed 500 characters'],
  })
  company!: string;

  @Prop({
    required: [true, 'Service type is required'],
    trim: true,
    enum: {
      values: [
        'Identity Verification',
        'Business Verification',
        'Document Verification',
        'Background Checks',
        'Other',
      ],
      message: 'Please select a valid service type',
    },
    maxlength: [50, 'Service type cannot exceed 50 characters'],
  })
  serviceType!: string;
}

export const VerificationServiceSchema =
  SchemaFactory.createForClass(VerificationService);

VerificationServiceSchema.index(
  { email: 1, company: 1 },
  { unique: true, name: 'unique_email_company' },
);
