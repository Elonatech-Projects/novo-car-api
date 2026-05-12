// src/custom-quote/schema/custom-quote.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomQuoteDocument = CustomQuote & Document;

@Schema({ timestamps: true })
export class CustomQuote {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  company?: string;

  @Prop()
  jobTitle?: string;

  @Prop({ required: true })
  vehicleCount: string;

  @Prop({ required: true })
  vehicleType: string;

  @Prop({ required: true })
  leaseDuration: string;

  @Prop()
  budget?: string;

  @Prop()
  requirements?: string;
}

export const CustomQuoteSchema = SchemaFactory.createForClass(CustomQuote);
