import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ContactUs } from './schema/contact-us.schema';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ContactUsDto } from './dto/contact-us.dto';
import { SmsService } from '../notifications/sms/sms.service';

@Injectable()
export class ContactUsService {
  private readonly logger: Logger = new Logger(ContactUsService.name);
  private readonly companySender: string;
  private readonly companyPhone: string;

  constructor(
    @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUs>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {
    this.companySender =
      this.configService.get<string>('TERMII_SENDER_ID_COMPANY') ?? 'Novo';
    this.companyPhone =
      this.configService.get<string>('NOVO_COMPANY_PHONE') ?? '2349072711009';
  }

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
        'contact-us-admin',
        { ...dto },
      );
    }

    try {
      const smsMessage =
        `Novo: New contact us message!\n\n` +
        `From: ${dto.fullName}\n` +
        `Email: ${dto.email}\n` +
        `Phone: ${dto.phone}\n` +
        `Message: ${dto.message}`;

      await this.smsService.sendSms(
        [this.companyPhone],
        smsMessage,
        this.companySender,
      );
      this.logger.log(
        `Contact us SMS notification sent to company (${this.companyPhone})`,
      );
    } catch (error) {
      this.logger.error(
        'Contact Us SMS failed:',
        error instanceof Error ? error.stack : String(error),
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
