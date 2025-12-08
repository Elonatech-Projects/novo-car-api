import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Auth } from '../../auth/schema/auth-schema';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class One extends Document {
  @Prop({ type: Types.ObjectId, ref: Auth.name, required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  departureDate: string;
}

export const OneWay = SchemaFactory.createForClass(One);
