// dto/create-booking-request.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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
  pickupLocation!: string;

  @IsString()
  @IsNotEmpty()
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
  specialRequests?: string;

  // User Info
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
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
  weddingVenue?: string;

  @IsOptional()
  @IsString()
  weddingDate?: string;

  @IsOptional()
  @IsNumber()
  numberOfCars?: number;

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
