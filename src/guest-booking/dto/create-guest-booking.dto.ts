import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';

export class CreateGuestBookingDto {
  // Guest info
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  nextOfKinName: string;

  @IsString()
  @IsNotEmpty()
  nextOfKinPhone: string;

  // Trip info (snapshot)
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @IsString()
  @IsNotEmpty()
  pickupDate: string;

  @IsString()
  @IsNotEmpty()
  shuttleType: string;

  @IsString()
  @IsNumber()
  price: number;
}
