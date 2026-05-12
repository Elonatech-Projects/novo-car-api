// create-car.dto.ts
// DTO for creating a new car entry in the database
// src\cars\dto\create-car.dto.ts
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsEnum } from 'class-validator';
import { CarCategory } from '../enums/car-category.enum';

export class CreateCarDto {
  @IsString()
  name!: string;

  @IsEnum(CarCategory)
  category!: CarCategory;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  subModel?: string;

  @IsOptional()
  @IsEnum(['Premium', 'Luxury'])
  tier?: 'Premium' | 'Luxury';

  @IsString()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
