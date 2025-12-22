import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString() @IsNotEmpty() pickupLocation: string;
  @IsString() @IsNotEmpty() dropoffLocation: string;
  @IsString() @IsNotEmpty() pickupDate: string;
}
