// schedule schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ required: true })
  from!: string;

  @Prop({ required: true })
  to!: string;

  @Prop({ required: true })
  departureTime!: string;

  @Prop({ required: true, min: 1 })
  capacity!: number;

  @Prop({ required: true, min: 0 })
  basePrice!: number;

  @Prop({
    type: [String],
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    required: true,
  })
  operatingDays!: string[];

  @Prop({ default: true })
  isActive!: boolean;
}
export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ from: 1, to: 1 });
ScheduleSchema.index({ operatingDays: 1 });
