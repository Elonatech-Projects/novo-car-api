// src/newsroom/schema/newsroom.schema.ts
// Mongoose schema for a Novo Cars newsroom article

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsroomDocument = Newsroom & Document;

// Allowed category values — matches the frontend filter tabs
export const NEWSROOM_CATEGORIES = [
  'Company News',
  'Press Release',
  'Industry Updates',
  'Events',
] as const;

export type NewsroomCategory = (typeof NEWSROOM_CATEGORIES)[number];

@Schema({ timestamps: true })
export class Newsroom {
  // Short headline shown on cards and the article detail page
  @Prop({ required: true, trim: true })
  title!: string;

  // One- or two-sentence teaser shown on the cards grid
  @Prop({ required: true, trim: true })
  excerpt!: string;

  // Full article body — plain text or HTML safe string
  @Prop({ required: true })
  content!: string;

  // Categorisation — drives the filter tabs on the frontend
  @Prop({ required: true, enum: NEWSROOM_CATEGORIES })
  category!: NewsroomCategory;

  // Cloudinary secure URL — uploaded separately via /newsroom/upload-image
  @Prop({ required: true })
  image!: string;

  // Human-readable display date e.g. "May 2025"
  @Prop({ required: true, trim: true })
  date!: string;

  // Optional byline
  @Prop({ trim: true })
  author?: string;

  // Pin this article to the top of the newsroom as the featured story
  @Prop({ default: false })
  featured!: boolean;

  // Soft-delete / draft toggle — only published articles are served publicly
  @Prop({ default: true })
  isPublished!: boolean;

  // URL-friendly slug auto-generated from the title on create
  // e.g. "Orange Driving School" → "orange-driving-school"
  // Unique index ensures no two articles share the same URL
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;
}

export const NewsroomSchema = SchemaFactory.createForClass(Newsroom);
