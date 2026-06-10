// Auth Schema
// src\auth\schema\auth-schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;
@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true })
  name!: string;

  @Prop({
    required: true,
    unique: true,
  })
  email!: string;

  @Prop({
    required: true,
  })
  password!: string;

  @Prop({
    required: true,
  })
  phoneNumber!: string;

  @Prop({ type: String, default: null })
  resetPasswordToken?: string | null;

  @Prop({ type: Date, default: null })
  resetPasswordExpires?: Date | null;

  @Prop({ type: Date, default: null })
  lastLogin?: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);

// Note: email index is declared via unique:true on the @Prop above — no duplicate needed here.
