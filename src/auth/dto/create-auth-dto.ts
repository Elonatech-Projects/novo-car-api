import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  @MinLength(7, { message: 'Phone number is too short' })
  phoneNumber: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, {
    message:
      'Password must contain upper, lower, number, and special character',
  })
  password: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, {
    message:
      'Confirm password must contain upper, lower, number, and special character',
  })
  confirmPassword: string;

  // id: string;
}
