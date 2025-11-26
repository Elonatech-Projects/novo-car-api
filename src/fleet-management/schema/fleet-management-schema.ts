import { Prop } from '@nestjs/mongoose';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { FleetManagement } from "../../fleet-management/schema/fleet-management-schema";
import { Auth } from '../../auth/schema/auth-schema';

@Schema({ timestamps: true })
export class FleetManagement extends Document {
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

  @Prop({ required: true })
  notes: string;
}

export const FleetManagementSchema =
  SchemaFactory.createForClass(FleetManagement);
