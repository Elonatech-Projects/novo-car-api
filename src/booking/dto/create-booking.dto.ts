import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsString() @IsNotEmpty() pickupLocation: string;
  @IsString() @IsNotEmpty() dropoffLocation: string;
  @IsString() @IsNotEmpty() pickupDate: string;
  @IsString() @IsNotEmpty() pickupTime: string;
  @IsString() @IsNotEmpty() shuttleType: string;
  @IsNumber() passengers: number;
}
