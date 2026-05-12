// Create Auth DTO
// This DTO defines the structure and validation rules for the data required to create a new user account. It includes fields for name, email, phone number, password, and confirm password, along with appropriate validation decorators from the class-validator library.
// src/auth/dto/create-auth-dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEX } from '../../common/constants/password';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  @MinLength(7, { message: 'Phone number is too short' })
  phoneNumber!: string;

  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain upper, lower, number, and special character',
  })
  password!: string;

  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message:
      'Confirm password must contain upper, lower, number, and special character',
  })
  confirmPassword!: string;

  // id: string;
}
