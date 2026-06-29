// Admin Schema
// src\admin\schema\admin-schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminDocument = HydratedDocument<Admin>;

export type AdminRole = 'super_admin' | 'admin';

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: false, trim: true })
  name?: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  // 'super_admin' can manage other admins; 'admin' is a regular dashboard user.
  @Prop({ required: true, enum: ['super_admin', 'admin'], default: 'admin' })
  role!: AdminRole;

  // Disabled admins keep their record but cannot log in.
  @Prop({ default: true })
  isActive!: boolean;

  // Audit trail: which admin created this one (null for the bootstrap super admin).
  @Prop({ required: false })
  createdBy?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
