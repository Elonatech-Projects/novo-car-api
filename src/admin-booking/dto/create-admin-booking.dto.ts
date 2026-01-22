// Create AdminBookingDto;
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  // ArrayNotEmpty,
  IsArray,
  IsNumber,
} from 'class-validator';
import type { ShuttleType } from '../schema/adminbooking.schema';
import { Type } from 'class-transformer';

export class CreateAdminBookingDto {
  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @IsString()
  // @IsNotEmpty()
  @IsOptional()
  pickupDate: string;

  // @IsString()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsEnum([
    'Work Shuttle',
    'Airport Shuttle',
    'School Shuttle',
    'Event Shuttle',
    'Luxury Shuttle',
    'Standard Shuttle',
  ])
  // @IsNotEmpty()
  @IsOptional()
  shuttleType: ShuttleType;

  @IsArray()
  // @ArrayNotEmpty()
  // @IsEnum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], { each: true })
  availableDays: string[];
}
