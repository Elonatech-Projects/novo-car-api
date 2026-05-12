// car.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CarCategory } from '../enums/car-category.enum';

export type CarDocument = HydratedDocument<Car>;

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true })
  name!: string;

  @Prop({ enum: CarCategory, required: true })
  category!: CarCategory; // Corolla, SUV, etc.

  @Prop()
  model!: string; // 2014, Prado, etc.

  @Prop()
  subModel?: string; // TXL, VX, etc.

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  features!: string[];

  @Prop({ type: [String], required: true })
  images!: string[];

  @Prop({ required: true })
  price!: number;

  @Prop({ default: true })
  isAvailable!: boolean;

  @Prop({ enum: ['Premium', 'Luxury'], required: false })
  tier?: 'Premium' | 'Luxury';
}

export const CarSchema = SchemaFactory.createForClass(Car);

CarSchema.index({ category: 1, isAvailable: 1 });
