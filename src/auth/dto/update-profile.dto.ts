// Update Profile DTO
// Deliberately separate from UpdateAuthDto (which extends CreateAuthDto and
// therefore inherits password/confirmPassword validation) — profile edits
// only ever touch name/email/phoneNumber. Password changes go through the
// existing dedicated POST /auth/change-password endpoint.
// src/auth/dto/update-profile.dto.ts
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  @MinLength(7, { message: 'Phone number is too short' })
  phoneNumber?: string;
}
