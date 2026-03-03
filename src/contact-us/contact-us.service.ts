import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ContactUs } from './schema/contact-us.schema';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ContactUsDto } from './dto/contact-us.dto';

@Injectable()
export class ContactUsService {
  private readonly logger: Logger = new Logger(ContactUsService.name);
  constructor(
    @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUs>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async createContactUs(dto: ContactUsDto) {
    const { fullName, email, phone, message } = dto;
    // Implement logic to save contact us message to the database
    // and send notification email if needed
    for (const [key, value] of Object.entries(dto)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    const contactUsData = {
      fullName,
      email,
      phone,
      message,
    };

    const createdContactUs = await this.contactUsModel.create(contactUsData);

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured — skipping admin email.');
    } else {
      await this.mailService.sendTemplateEmail(
        adminEmail,
        'New Contact Us Received - Novo Cars',
        'contact-us-notification',
        { ...dto },
      );
    }

    return {
      message: 'Contact us message received successfully',
      success: true,
      emailSent: !!adminEmail,
      createdContactUs,
    };
  }
}
