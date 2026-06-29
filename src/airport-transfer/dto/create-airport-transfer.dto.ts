// Create Airport Transfer DTO
// src/airport-transfer/dto/create-airport-transfer.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
} from 'class-validator';

export class CreateAirportTransferDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(7)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  airport!: string;

  @IsString()
  @IsNotEmpty()
  terminal!: string;

  @IsDateString()
  date!: string;

  @IsString()
  vehicle!: string;

  @IsString()
  category!: string;

  // Pickup time + locations added per website feedback.
  @IsOptional()
  @IsString()
  pickupTime?: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
