// src/schedule-consultation/schema/schedule-consultation.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduleConsultationDocument = ScheduleConsultation & Document;

@Schema({ timestamps: true })
export class ScheduleConsultation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  company?: string;

  @Prop({ required: true })
  consultationDate: string;

  @Prop({ required: true })
  consultationTime: string;

  @Prop({ required: true })
  consultationType: 'video' | 'phone' | 'in-person';

  @Prop({ required: true })
  attendees: number;

  @Prop()
  requirements?: string;
}

export const ScheduleConsultationSchema = SchemaFactory.createForClass(
  ScheduleConsultation,
);
