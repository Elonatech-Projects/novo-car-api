// src\shuttle-booking\dto\create-shuttle-booking.dto.ts
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';
import { ShuttleType } from '../enums';

export class CreateShuttleBookingDto {
  @IsEnum(ShuttleType)
  shuttleType!: ShuttleType;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  pickupLocation!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  dropoffLocation!: string;

  @IsString()
  bookingDate!: string;

  @IsString()
  pickupTime!: string;

  @IsNumber()
  @Min(1)
  numberOfPassengers!: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  /* User */
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  phoneNumber?: string;

  /* Airport */
  @IsOptional()
  @IsString()
  @MinLength(2)
  airport?: string;

  @IsOptional()
  @IsString()
  flightNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  terminal?: string;

  /* Wedding */
  @IsOptional()
  @IsString()
  @MinLength(3)
  weddingVenue?: string;

  @IsOptional()
  @IsString()
  weddingDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfCars?: number;

  /* Tour */
  @IsOptional()
  @IsString()
  @MinLength(2)
  tourPackage?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  tourDuration?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  accommodationType?: string;

  // @IsOptional()
  // totalPrice?: number;
}
