// Car Rentals Dto
// Defines the data transfer object for car rentals, including validation rules.
// src\car-rentals\dto\car-rentals.dto.ts
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CarRentalsDto {
  @IsString() @IsNotEmpty() bookingCategory!: string;
  @IsString() @IsNotEmpty() bookingModel!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() @IsNotEmpty() email!: string;
  @IsString() @IsNotEmpty() @Matches(/^[0-9]{10,15}$/) phoneNumber!: string;
  @IsString() @IsNotEmpty() pickupLocation!: string;
  @IsString() @IsNotEmpty() dropoffLocation!: string;
  @IsDateString() @IsNotEmpty() pickupDate!: string;
  @IsDateString() @IsNotEmpty() dropoffDate!: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() subModel?: string;
  @IsString() @IsOptional() price?: string;
}
