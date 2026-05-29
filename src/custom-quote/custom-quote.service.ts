import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomQuote, CustomQuoteDocument } from './schema/custom-quote.schema';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notifications/notifications.service';
import { CreateCustomQuoteDto } from './dto/create-custom-quote.dto';
import { SmsService } from '../notifications/sms/sms.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class CustomQuoteService {
  private readonly logger = new Logger(CustomQuoteService.name);
  private readonly companySender: string;
  private readonly companyPhone: string;

  constructor(
    @InjectModel(CustomQuote.name)
    private customQuoteModel: Model<CustomQuoteDocument>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
  ) {
    this.companySender =
      this.configService.get<string>('TERMII_SENDER_ID_COMPANY') ?? 'Novo';
    this.companyPhone =
      this.configService.get<string>('NOVO_COMPANY_PHONE') ?? '2349072711009';
  }

  async createCustomQuote(dto: CreateCustomQuoteDto) {
    const quoteData = {
      ...dto,
      company: dto.company || '',
      jobTitle: dto.jobTitle || '',
      requirements: dto.requirements || '',
    };

    const createdQuote = await this.customQuoteModel.create(quoteData);

    /* ---------- USER EMAIL ----------- */
    // try {
    //   await this.notificationService.sendEmail({
    //     to: dto.email,
    //     subject: 'Custom Quote Request Received - Novo Cars',
    //     template: 'custom-quote',
    //     context: { ...dto },
    //   });

    //   this.logger.log('Custom quote email sent to user');
    // } catch (error) {
    //   this.logger.error('Failed to send user email', error);
    // }

    /* ---------- ADMIN EMAIL ----------- */
    const adminEmail = process.env.ADMIN_EMAIL || '';

    try {
      await this.mailService.sendTemplateEmail(
        adminEmail,
        'New Custom Quote Request - Novo Cars',
        'custom-quote-admin',
        { ...dto },
      );
    } catch (error) {
      this.logger.error('Failed to send admin email', error);
    }

    const adminEmail2 = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail2) {
      this.logger.warn(
        'ADMIN_EMAIL not configured — skipping Custom Quote admin email.',
      );
    } else {
      await this.mailService.sendTemplateEmail(
        adminEmail2,
        'New Custom Quote Request - Novo Cars',
        'custom-quote-admin',
        { ...dto },
      );
    }

    try {
      const smsMessage =
        `Novo: New custom quote request!\n\n` +
        `From: ${dto.name}\n` +
        `Email: ${dto.email}\n` +
        `Phone: ${dto.phoneNumber}\n` +
        `Company: ${dto.company}\n` +
        `Job Title: ${dto.jobTitle}\n` +
        `Requirements: ${dto.requirements}`;

      await this.smsService.sendSms([this.companyPhone], smsMessage);
    } catch (error) {
      this.logger.error('Failed to send SMS', error);
    }

    return {
      success: true,
      message: 'Custom quote request submitted successfully',
      data: createdQuote,
    };
  }
}
