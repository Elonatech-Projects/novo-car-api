// src\od-school\dto\od-school.dto.ts
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Equals,
} from 'class-validator';
import { OD_SCHOOL_PACKAGES } from '../config/od-packages';

export class CreateODSchoolDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[a-zA-Z\s']+$/, {
    message: 'Name can only contain letters, spaces, and apostrophes',
  })
  name!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
    message: 'Please provide a valid phone number',
  })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Package selection is required' })
  @IsIn(OD_SCHOOL_PACKAGES.map((p) => p.id), {
    message: 'Invalid package selected. Please choose a valid package',
  })
  packageId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Preferred date is required' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Preferred date must be in YYYY-MM-DD format',
  })
  preferredDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'Preferred time is required' })
  @Matches(/^(0[9]|1[0-2]):[0-5][0-9] (AM|PM)$/, {
    message: 'Preferred time must be in format HH:MM AM/PM (e.g., 09:00 AM)',
  })
  preferredTime!: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s.,!?'-]{0,500}$/, {
    message:
      'Message can only contain letters, numbers, and basic punctuation (max 500 characters)',
  })
  message?: string;

  @IsBoolean()
  @Equals(true, { message: 'You must agree to the terms and conditions' })
  agreeToTerms!: boolean;
}
