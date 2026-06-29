// Bootstrap DTO — used ONCE to seed the very first super admin.
// src\admin\dto\bootstrap-admin.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class BootstrapAdminDto {
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

  // Must match process.env.ADMIN_SETUP_KEY. Without it the endpoint refuses.
  @IsNotEmpty()
  @IsString()
  setupKey!: string;
}
