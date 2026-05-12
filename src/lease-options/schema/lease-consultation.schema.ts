// src/lease-options/schema/lease-consultation.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaseConsultationDocument = LeaseConsultation & Document;

@Schema({ timestamps: true })
export class LeaseConsultation {
  @Prop({ required: true })
  leaseType: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  vehicles: number;

  @Prop({ required: true })
  useCase: 'personal' | 'business';

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  company?: string;
}

export const LeaseConsultationSchema =
  SchemaFactory.createForClass(LeaseConsultation);
