import { IsNotEmpty, IsString } from 'class-validator';

export class SearchBookingDto {
  @IsString() @IsNotEmpty() pickupLocation: string;
  @IsString() @IsNotEmpty() dropoffLocation: string;
  @IsString() @IsNotEmpty() pickupDate: string;
  // @IsString() @IsOptional() price: string;
}
