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
// import { isValidEmail, isValidPhone } from '../../common/utils/validators';

export class CarRentalsDto {
  @IsString() @IsNotEmpty() bookingCategory!: string;
  @IsString() @IsNotEmpty() bookingModel!: string;
  @IsString() @IsNotEmpty({ message: 'Name is required' }) name!: string;
  @IsEmail()
  @IsNotEmpty({ message: 'Please provide a valid email address' })
  email!: string;
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9]{10,15}$/)
  phoneNumber!: string;
  @IsString()
  @IsNotEmpty({ message: 'Pickup location is required' })
  pickupLocation!: string;
  @IsString()
  @IsNotEmpty({ message: 'Dropoff location is required' })
  dropoffLocation!: string;
  @IsDateString()
  @IsNotEmpty({ message: 'Pickup date is required' })
  pickupDate!: string;
  @IsDateString()
  @IsNotEmpty({ message: 'Dropoff date is required' })
  dropoffDate!: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() subModel?: string;
  @IsString() @IsOptional() rentalDuration?: string;
  @IsString() @IsOptional() price?: string;
  // Pickup time added per website feedback (Booking a Ride form).
  @IsString() @IsOptional() pickupTime?: string;
}
