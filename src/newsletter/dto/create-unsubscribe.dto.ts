// src\newsletter\dto\create-unsubscribe.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUnsubscribeDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
