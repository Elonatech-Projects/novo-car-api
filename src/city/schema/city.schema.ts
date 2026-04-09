// This file defines the Mongoose schema for the City entity, which includes fields for name, code, and active status. The schema is decorated with NestJS decorators to specify field requirements and constraints. The CityDocument type is defined for use in service and controller layers when working with City data.
// src\city\schema\city.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CityDocument = HydratedDocument<City>;

@Schema({ timestamps: true })
export class City {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  code!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CitySchema = SchemaFactory.createForClass(City);
