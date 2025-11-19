import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Auth extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    // match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email: string;

  @Prop({
    required: true,
    // match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
  })
  password: string;

  @Prop({
    required: true,
    // match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
  })
  confirmPassword: string;

  @Prop({
    required: true,
  })
  phoneNumber: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
