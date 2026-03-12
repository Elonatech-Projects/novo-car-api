// src/notifications/notification.service.ts

import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { SendEmailOptions } from './interfaces/email-notification.interface';

@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailService) {}

  /**
   * Generic email sender used across the system
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.mailService.sendTemplateEmail(
      options.to,
      options.subject,
      options.template,
      options.context,
      options.attachments,
    );
  }
}
