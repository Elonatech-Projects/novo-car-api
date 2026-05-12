// Change-Password DTO
// This DTO defines the structure and validation rules for the data required to reset a user's password. It includes fields for the reset token and the new password, along with appropriate validation decorators from the class-validator library.
// src/auth/dto/forgot-password.dto.ts
import { IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../../common/constants/password';
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword!: string;

  @IsNotEmpty({ message: 'New password is required' })
  @Matches(PASSWORD_REGEX, {
    message:
      'New password must contain upper, lower, number, and special character',
  })
  newPassword!: string;
}
