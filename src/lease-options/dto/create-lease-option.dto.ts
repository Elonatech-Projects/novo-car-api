// src/lease-options/dto/create-lease-consultation.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLeaseConsultationDto {
  @IsString()
  @IsNotEmpty()
  leaseType: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsNumber()
  @Min(1)
  vehicles: number;

  @IsString()
  @IsNotEmpty()
  useCase: 'personal' | 'business';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  company?: string;
}
