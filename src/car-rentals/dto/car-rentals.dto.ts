import { IsNotEmpty, IsString } from 'class-validator';

export class CarRentalsDto {
  @IsString() @IsNotEmpty() bookingCategory: string;
  @IsString() @IsNotEmpty() bookingModel: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() phoneNumber: string;
  @IsString() @IsNotEmpty() pickupDate: string;
  @IsString() @IsNotEmpty() dropoffDate: string;
  @IsString() @IsNotEmpty() notes: string;
  @IsString() @IsNotEmpty() subModel: string;
}
