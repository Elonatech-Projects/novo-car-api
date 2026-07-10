import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateScheduleConsultationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(\+234|0)[789][01]\d{8}$/, {
    message: 'Phone must be a valid Nigerian number (e.g. 08012345678)',
  })
  phone: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Consultation date must be in YYYY-MM-DD format',
  })
  consultationDate: string;

  @IsString()
  @IsNotEmpty()
  consultationTime: string;

  @IsIn(['video', 'phone', 'in-person'])
  consultationType: 'video' | 'phone' | 'in-person';

  @IsNumber()
  @Min(1)
  attendees: number;

  @IsOptional()
  @IsString()
  requirements?: string;
}
