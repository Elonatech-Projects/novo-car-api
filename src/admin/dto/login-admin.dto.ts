// Login DTO
// src\admin\dto\login-admin.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
