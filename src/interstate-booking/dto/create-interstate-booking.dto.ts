// src/interstate-booking/dto/create-interstate-booking.dto.ts
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInterstateBookingDto {
  @IsString() @IsNotEmpty() name!: string;

  @IsEmail() email!: string;

  @IsString() @IsNotEmpty() phone!: string;

  @IsString() @IsNotEmpty() pickupLocation!: string;

  @IsString() @IsNotEmpty() dropoffLocation!: string;

  @IsString() @IsNotEmpty() date!: string;

  @IsOptional() @IsString() time?: string;

  @Type(() => Number) @IsInt() @Min(1) rentalDays!: number;

  @Type(() => Number) @IsInt() @Min(1) vehicleCount!: number;

  @IsString() @IsNotEmpty() vehicleType!: string;

  @Type(() => Number) @IsInt() @Min(1) persons!: number;

  @IsOptional() @IsString() notes?: string;
}
