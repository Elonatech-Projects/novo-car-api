import {
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  // IsEnum,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../types/payment.type';

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
  numberOfPassengers: number;

  // Guest fields (required only if userId is absent – enforced in service)
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

  @IsOptional()
  userId?: string;

  @IsString()
  bookingReference: string;

  @IsOptional()
  payment?: {
    method: PaymentMethod;
    amount: number;
    status: PaymentStatus;
    verified: boolean;
    reference?: string;
    paystackReference?: string;
  };
}
