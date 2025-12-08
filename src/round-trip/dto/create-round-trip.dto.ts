import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoundTripDto {
  @IsString() @IsNotEmpty() from: string;
  @IsString() @IsNotEmpty() to: string;
  @IsString() @IsNotEmpty() departureDate: string;
  @IsString() @IsNotEmpty() returnDate: string;
}
