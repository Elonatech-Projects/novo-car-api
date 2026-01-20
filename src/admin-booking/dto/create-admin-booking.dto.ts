import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
import type { ShuttleType, WeekDay } from '../schema/adminbooking.schema';

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

  @IsString()
  @IsOptional()
  price: string;

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
  @ArrayNotEmpty()
  @IsEnum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], { each: true })
  availableDays: WeekDay[];
}
