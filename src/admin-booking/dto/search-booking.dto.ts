import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchBookingDto {
  @IsString() @IsNotEmpty() pickupLocation: string;
  @IsString() @IsNotEmpty() dropoffLocation: string;
  @IsString() @IsOptional() pickupDate?: string;
  // @IsString() @IsOptional() price: string;
}
