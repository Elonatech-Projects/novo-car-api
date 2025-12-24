import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminDocument = HydratedDocument<Admin>;
@Schema({ timestamps: true })
export class Admin extends Document {
  // Define admin properties here
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
