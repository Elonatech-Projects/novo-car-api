import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  Matches,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateUserBookingDto {
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,15}$/, { message: 'Phone must be digits only' })
  phone: string;

  @IsNumber()
  @Min(1)
  passengers: number;

  @IsDateString()
  travelDate: string;
}
