import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Auth extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
  })
  confirmPassword: string;

  @Prop({
    required: true,
  })
  phoneNumber: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
