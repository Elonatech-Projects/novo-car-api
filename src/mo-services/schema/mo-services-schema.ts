import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ManPowerDocument = ManPower & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    // transform: function (doc, ret) {
    //   delete (ret as any).__v;
    //   return ret;
    // },
  },
})
export class ManPower extends Document {
  @Prop({
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
  })
  name: string;

  @Prop({
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  })
  email: string;

  @Prop({
    required: [true, 'Phone number is required'],
    trim: true,
  })
  phoneNumber: string;

  @Prop({
    required: [true, 'Company name is required'],
    trim: true,
  })
  companyName: string;

  @Prop({
    required: [true, 'Industry is required'],
    enum: {
      values: [
        'Manufacturing',
        'Logistics',
        'Construction',
        'Hospitality',
        'Healthcare',
        'Retail',
        'IT & Tech',
        'Energy',
      ],
      message: 'Please select a valid industry',
    },
  })
  industry: string;

  @Prop({
    required: false,
    default: '',
    maxlength: [1000, 'Details cannot exceed 1000 characters'],
  })
  details: string;

  @Prop({
    required: [true, 'Staff count is required'],
    set: (val: any) => Math.max(1, parseInt(val) || 1).toString(),
  })
  staff: string;

  @Prop({
    required: [true, 'Duration is required'],
    enum: {
      values: [
        'Short-term (1–3 months)',
        'Medium-term (3–12 months)',
        'Long-term (1+ year)',
      ],
      message: 'Please select a valid duration',
    },
  })
  duration: string;

  @Prop({
    default: 'pending',
    enum: [
      'pending',
      'reviewing',
      'contacted',
      'approved',
      'rejected',
      'completed',
    ],
  })
  status: string;

  @Prop({ default: false })
  isArchived: boolean;
}

export const ManPowerSchema = SchemaFactory.createForClass(ManPower);

// Add indexes for better query performance
ManPowerSchema.index({ email: 1, companyName: 1 });
ManPowerSchema.index({ status: 1 });
ManPowerSchema.index({ createdAt: -1 });
ManPowerSchema.index({ industry: 1 });
