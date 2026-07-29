// dto/create-booking-request.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export enum ShuttleTypeEnum {
  AIRPORT = 'airport',
  WEDDING = 'wedding',
  TOUR = 'tour',
  EVENT = 'event',
  LUXURY = 'luxury',
  STANDARD = 'standard',
}

export class CreateBookingRequestDto {
  @IsEnum(ShuttleTypeEnum)
  shuttleType!: ShuttleTypeEnum;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  pickupLocation!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  dropoffLocation!: string;

  @IsString()
  @IsNotEmpty()
  bookingDate!: string;

  @IsString()
  @IsNotEmpty()
  pickupTime!: string;

  @IsNumber()
  @Min(1)
  numberOfPassengers!: number;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  // User Info
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  phoneNumber!: string;

  // Airport
  @IsOptional()
  @IsString()
  airport?: string;

  @IsOptional()
  @IsString()
  flightNumber?: string;

  @IsOptional()
  @IsString()
  terminal?: string;

  // Wedding
  @IsOptional()
  @IsString()
  @MinLength(3)
  weddingVenue?: string;

  @IsOptional()
  @IsString()
  weddingDate?: string;

  @IsOptional()
  @IsNumber()
  numberOfCars?: number;

  @IsOptional()
  @IsString()
  weddingPackage?: string;

  // Tour
  @IsOptional()
  @IsString()
  tourPackage?: string;

  @IsOptional()
  @IsNumber()
  tourDuration?: number;

  @IsOptional()
  @IsString()
  accommodationType?: string;
}
