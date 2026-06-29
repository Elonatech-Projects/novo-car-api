// Admin DTO
// src\admin\dto\create-admin-dto.ts
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { AdminRole } from '../schema/admin-schema';

export class CreateAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  // Optional — a super admin may create either an 'admin' or another 'super_admin'.
  // Defaults to 'admin' in the service if omitted.
  @IsOptional()
  @IsIn(['super_admin', 'admin'])
  role?: AdminRole;
}

// Create a key;
// node -e "console.log('ADMIN_SETUP_KEY=' + require('crypto').randomBytes(48).toString('base64url'));"
