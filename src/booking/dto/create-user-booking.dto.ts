import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  Matches,
  IsDateString,
  Min,
  IsOptional,
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

  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @IsOptional()
  @IsString()
  pickupTime?: string;
}
