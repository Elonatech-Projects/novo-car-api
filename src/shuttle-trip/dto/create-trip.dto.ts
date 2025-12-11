import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import type { TripType } from '../schema/trip.schema';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  departureDate: string;

  @IsOptional()
  @IsString()
  returnDate?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsEnum(['one-way', 'round-trip'])
  @IsOptional()
  tripType?: TripType;
}
