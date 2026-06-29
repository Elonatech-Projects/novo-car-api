// schedule schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ required: true, unique: true })
  code!: string;

  // Human-readable route name shown to users (e.g. "Lekki Phase 1 → Berger").
  // The Mongo _id is still used everywhere internally; this is display-only and
  // admins can edit it freely.
  @Prop({ required: false, trim: true })
  name?: string;

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

  // ── NShuttle additions ──────────────────────────────────────────────────────
  // Display name of the vehicle running this route (e.g. "Toyota Coaster").
  @Prop({ required: false, trim: true })
  vehicle?: string;

  // Image URL(s) of the vehicle so riders can see what they're boarding.
  @Prop({ type: [String], default: [] })
  vehicleImages!: string[];

  // Bookable plans for this route (single / round / weekly / monthly …).
  // `basePrice` above stays as the single-trip fare; `plans` adds bundles.
  // Each plan is fully admin-defined so new plans need no code change.
  @Prop({
    type: [
      {
        key: { type: String, required: true }, // 'single' | 'round' | 'weekly' | 'monthly' | custom
        label: { type: String, required: true }, // e.g. "Weekly (10 trips)"
        trips: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    default: [],
  })
  plans!: SchedulePlan[];

  @Prop({ default: true })
  isActive!: boolean;
}

export class SchedulePlan {
  key!: string;
  label!: string;
  trips!: number;
  price!: number;
}
export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ from: 1, to: 1 });
ScheduleSchema.index({ operatingDays: 1 });
