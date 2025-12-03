import { Prop } from '@nestjs/mongoose';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { Auth } from '../../auth/schema/auth-schema';
// import { Auth } from '../../auth/schema/auth-schema';

@Schema({ timestamps: true })
export class CareerJobs extends Document {
  // @Prop({ required: true, type: Types.ObjectId, ref: Auth.name })
  // user: Types.ObjectId;

  @Prop({ required: true })
  header: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  postedDate: string;

  @Prop({ required: true })
  skills: [string];
}

export const CareerJobsSchema = SchemaFactory.createForClass(CareerJobs);
