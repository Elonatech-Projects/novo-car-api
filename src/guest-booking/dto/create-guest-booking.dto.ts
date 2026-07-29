import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGuestBookingDto {
  // Guest info
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nextOfKinName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  nextOfKinPhone: string;

  // Trip info (snapshot)
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  dropoffLocation: string;

  @IsString()
  @IsNotEmpty()
  pickupDate: string;

  @IsString()
  @IsNotEmpty()
  shuttleType: string;

  // Was previously @IsString() + @IsNumber() together — contradictory
  // decorators that no value could ever satisfy simultaneously, since
  // class-validator requires ALL decorators to pass.
  @IsNumber()
  @Min(0)
  price: number;
}
