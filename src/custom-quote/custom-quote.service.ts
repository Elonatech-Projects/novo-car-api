import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomQuote, CustomQuoteDocument } from './schema/custom-quote.schema';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notifications/notifications.service';
import { CreateCustomQuoteDto } from './dto/create-custom-quote.dto';
@Injectable()
export class CustomQuoteService {
  private readonly logger = new Logger(CustomQuoteService.name);

  constructor(
    @InjectModel(CustomQuote.name)
    private customQuoteModel: Model<CustomQuoteDocument>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) {}

  async createCustomQuote(dto: CreateCustomQuoteDto) {
    const quoteData = {
      ...dto,
      company: dto.company || '',
      jobTitle: dto.jobTitle || '',
      requirements: dto.requirements || '',
    };

    const createdQuote = await this.customQuoteModel.create(quoteData);

    /* ---------- USER EMAIL ----------- */
    try {
      await this.notificationService.sendEmail({
        to: dto.email,
        subject: 'Custom Quote Request Received - Novo Cars',
        template: 'custom-quote',
        context: { ...dto },
      });

      this.logger.log('Custom quote email sent to user');
    } catch (error) {
      this.logger.error('Failed to send user email', error);
    }

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

    return {
      success: true,
      message: 'Custom quote request submitted successfully',
      data: createdQuote,
    };
  }
}
