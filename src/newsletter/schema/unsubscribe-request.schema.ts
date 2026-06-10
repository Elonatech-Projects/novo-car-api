import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UnsubscribeRequestDocument = HydratedDocument<UnsubscribeRequest>;

@Schema({ timestamps: true, versionKey: false })
export class UnsubscribeRequest {
  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ required: false, trim: true })
  comments?: string;

  // 'pending' until admin deletes from Mailchimp, then 'processed'
  @Prop({ default: 'pending' })
  status: string;
}

export const UnsubscribeRequestSchema =
  SchemaFactory.createForClass(UnsubscribeRequest);
