import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { Auth } from 'src/auth/schema/auth-schema';
import { Auth } from '../../auth/schema/auth-schema';

@Schema({ timestamps: true })
export class Shuttle extends Document {
  @Prop({ type: Types.ObjectId, ref: Auth.name, required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  pickup: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  date: string;
}

export const ShuttleServices = SchemaFactory.createForClass(Shuttle);
