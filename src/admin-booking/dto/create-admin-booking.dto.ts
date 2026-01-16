import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import type { ShuttleType } from '../schema/adminbooking.schema';

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
  @IsNotEmpty()
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
}
