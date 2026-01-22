// dto/create-user-booking.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsMongoId,
  //   IsNumber,
  //   Min,
} from 'class-validator';

export class anotherUserBookingDto {
  @IsMongoId()
  @IsNotEmpty()
  adminBookingId: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
