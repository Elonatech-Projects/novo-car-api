// create-newsletter.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateNewsletterDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsOptional()
  @IsString()
  source?: string; // 'homepage' | 'popup' — frontend passes this so we know the origin
}
