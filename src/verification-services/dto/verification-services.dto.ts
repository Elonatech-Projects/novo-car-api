// dto/verification-services.dto.ts
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateVerificationServicesDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name!: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Service type is required' })
  @IsString()
  @MaxLength(50, { message: 'Service type cannot exceed 50 characters' })
  @IsIn(
    [
      'Identity Verification',
      'Business Verification',
      'Document Verification',
      'Background Checks',
      'Other',
    ],
    { message: 'Please select a valid service type' },
  )
  serviceType!: string;

  @IsNotEmpty({ message: 'Company is required' })
  @IsString()
  @MaxLength(500, { message: 'Company name cannot exceed 500 characters' })
  company!: string;

  @IsNotEmpty({ message: 'Message is required' })
  @IsString()
  @MaxLength(500, { message: 'Message cannot exceed 500 characters' })
  message!: string;
}
