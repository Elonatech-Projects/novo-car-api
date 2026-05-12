// Reset Password DTO
// This DTO defines the structure and validation rules for the data required to reset a user's password. It includes fields for the reset token and the new password, along with appropriate validation decorators from the class-validator library.
// src/auth/dto/resetpassword.dto.ts
import { IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../../common/constants/password';

export class ResetPasswordDto {
  @IsNotEmpty()
  token!: string;

  @Matches(PASSWORD_REGEX)
  newPassword!: string;
}
