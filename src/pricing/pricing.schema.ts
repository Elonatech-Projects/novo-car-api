import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ShuttleType } from '../shuttle-booking/enums'; // 👈 runtime enum

@Schema({ timestamps: true })
export class Pricing {
  @Prop({ required: true, enum: ShuttleType, unique: true })
  shuttleType: ShuttleType;

  @Prop({ required: true })
  baseFare: number;

  @Prop()
  perKmRate?: number;

  @Prop()
  freeKm?: number;

  @Prop()
  perExtraPassenger?: number;

  @Prop()
  perExtraCar?: number;

  @Prop({ default: 1 })
  trafficMultiplier?: number;

  @Prop({ default: true })
  isActive: boolean;
}

export type PricingDocument = Pricing & Document;
export const PricingSchema = SchemaFactory.createForClass(Pricing);

PricingSchema.index({ shuttleType: 1 }, { unique: true });
