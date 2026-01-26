// Create-trip.dto
// /src/trips/create-trip.dto.ts
import {
  IsNotEmpty,
  IsString,
  // IsIn,
  // IsEnum,
  IsArray,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

enum ShuttleTypeEnum {
  WORK = 'Work Shuttle',
  AIRPORT = 'Airport Shuttle',
  SCHOOL = 'School Shuttle',
  EVENT = 'Event Shuttle',
  LUXURY = 'Luxury Shuttle',
  STANDARD = 'Standard Shuttle',
}

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  routeCode: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @IsEnum(ShuttleTypeEnum)
  @IsNotEmpty()
  shuttleType: string;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsString()
  @IsNotEmpty()
  departureTime: string; // "08:00"

  @IsString()
  @IsNotEmpty()
  arrivalTime: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], { each: true })
  operatingDays: string[];

  @IsArray()
  @IsOptional()
  amenities?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specificDates?: string[];
}
