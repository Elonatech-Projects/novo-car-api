// create-newsletter.dto.ts
import { IsEmail } from 'class-validator';

export class CreateNewsletterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}
