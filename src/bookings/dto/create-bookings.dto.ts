// src/bookings/dto/create-bookings.dto.ts
import { IsString, IsNumber, IsOptional, IsEmail, Min } from 'class-validator';

export class CreateBookingsDto {
  @IsString()
  shuttleType: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  dropoffLocation: string;

  @IsString()
  bookingDate: string;

  @IsString()
  pickupTime: string;

  @IsNumber()
  @Min(1)
  numberOfPassengers: number;

  // Guest fields (required if userId is absent – enforced in service)
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // Shuttle specific
  @IsOptional() @IsString() airport?: string;
  @IsOptional() @IsString() flightNumber?: string;
  @IsOptional() @IsString() terminal?: string;
  @IsOptional() @IsString() specialRequests?: string;

  @IsOptional() @IsString() weddingVenue?: string;
  @IsOptional() @IsString() weddingDate?: string;
  @IsOptional() @IsNumber() numberOfCars?: number;

  @IsOptional() @IsString() tourPackage?: string;
  @IsOptional() @IsNumber() tourDuration?: number;
  @IsOptional() @IsString() accommodationType?: string;

  // System
  @IsOptional()
  userId?: string;
}
