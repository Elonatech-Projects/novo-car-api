import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class Car extends Document {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  features: [string];

  @Prop({ required: true })
  images: [string];
}

export const CarSchema = SchemaFactory.createForClass(Car);
