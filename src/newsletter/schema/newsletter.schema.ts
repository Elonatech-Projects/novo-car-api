// src\newsletter\schema\newsletter.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsletterDocument = HydratedDocument<Newsletter>;

@Schema({ timestamps: true, versionKey: false })
export class Newsletter {
  @Prop({ required: false, trim: true })
  firstName?: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  email: string;

  // Where the subscription came from: 'homepage' | 'popup' | etc.
  @Prop({ default: 'website', trim: true })
  source: string;

  @Prop({ default: 'subscribed' })
  status: string;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
NewsletterSchema.index({ email: 1 }, { unique: true });
