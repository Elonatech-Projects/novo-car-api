// src/newsroom/dto/create-newsroom.dto.ts
// Validation DTO for creating a new newsroom article
// The `image` field must be a Cloudinary URL obtained from POST /newsroom/upload-image FIRST

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { NEWSROOM_CATEGORIES, NewsroomCategory } from '../schema/newsroom.schema';

export class CreateNewsroomDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Excerpt is required' })
  excerpt!: string;

  @IsString()
  @IsNotEmpty({ message: 'Content body is required' })
  content!: string;

  // Must be one of the four allowed category values
  @IsIn(NEWSROOM_CATEGORIES, {
    message: `Category must be one of: ${NEWSROOM_CATEGORIES.join(', ')}`,
  })
  category!: NewsroomCategory;

  // Cloudinary URL returned from the upload-image step
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image!: string;

  // Human-readable display date e.g. "May 2025"
  @IsString()
  @IsNotEmpty({ message: 'Date label is required' })
  date!: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
