import {
  IsNotEmpty,
  IsString,
  IsEmail,
  // IsPhoneNumber,
  IsNumberString,
  // Min,
  // Max,
  IsIn,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMoServicesDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(({ value }) => value.replace(/\D/g, '')) // Remove non-digits
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'Industry is required' })
  @IsIn(
    [
      'Manufacturing',
      'Logistics',
      'Construction',
      'Hospitality',
      'Healthcare',
      'Retail',
      'IT & Tech',
      'Energy',
    ],
    { message: 'Please select a valid industry' },
  )
  industry: string;

  @IsString()
  @IsOptional()
  details: string;

  @IsNumberString({}, { message: 'Staff count must be a number' })
  @Transform(({ value }) => Math.max(1, parseInt(value) || 1).toString())
  @IsNotEmpty({ message: 'Staff count is required' })
  staff: string;

  @IsString()
  @IsNotEmpty({ message: 'Duration is required' })
  @IsIn([
      'Short-term (1–3 months)',
      'Medium-term (3–12 months)',
      'Long-term (1+ year)',
    ],
    { message: 'Please select a valid duration' },
  )
  duration: string;
}

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'pending',
    'reviewing',
    'contacted',
    'approved',
    'rejected',
    'completed',
  ])
  status: string;
}
