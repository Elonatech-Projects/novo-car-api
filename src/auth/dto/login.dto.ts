// Login DTO
// This DTO defines the structure and validation rules for the data required to log in a user. It includes fields for email and password, along with appropriate validation decorators from the class-validator library.
// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}
