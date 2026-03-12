// src\job-application\schema\job-application.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobApplicationDocument = JobApplication & Document;

@Schema({ timestamps: true })
export class JobApplication {
  @Prop({ required: true })
  jobId!: string;

  @Prop({ required: true })
  jobTitle!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, index: true })
  email!: string;

  @Prop({ required: true })
  phoneNumber!: string;

  @Prop()
  gender?: string;

  @Prop({ required: true })
  address!: string;

  @Prop()
  dateOfBirth?: string;

  @Prop()
  employmentStatus?: string;

  @Prop()
  coverLetter?: string;

  @Prop()
  cvUrl?: string;

  @Prop()
  cvFileName?: string;

  @Prop({
    enum: ['pending', 'reviewed', 'rejected', 'accepted'],
    default: 'pending',
  })
  status!: string;
}

export const JobApplicationSchema =
  SchemaFactory.createForClass(JobApplication);
