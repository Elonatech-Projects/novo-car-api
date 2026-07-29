import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ContactUsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message!: string;
}
