import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { ShuttleType } from '../enums';

export class CreateShuttleBookingDto {
  @IsEnum(ShuttleType)
  shuttleType: ShuttleType;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @IsString()
  bookingDate: string;

  @IsString()
  pickupTime: string;

  @IsNumber()
  @Min(1)
  numberOfPassengers: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  /* User */
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  phoneNumber?: string;

  /* Airport */
  @IsOptional()
  airport?: string;

  @IsOptional()
  flightNumber?: string;

  @IsOptional()
  terminal?: string;

  /* Wedding */
  @IsOptional()
  weddingVenue?: string;

  @IsOptional()
  weddingDate?: string;

  @IsOptional()
  numberOfCars?: number;

  /* Tour */
  @IsOptional()
  tourPackage?: string;

  @IsOptional()
  tourDuration?: number;

  @IsOptional()
  accommodationType?: string;

  // @IsOptional()
  // totalPrice?: number;
}
