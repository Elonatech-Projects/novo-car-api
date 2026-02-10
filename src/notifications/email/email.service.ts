import { Injectable, Logger } from '@nestjs/common';
import { EmailPayload } from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(payload: EmailPayload): Promise<void> {
    // 🔌 PLUG & PLAY POINT
    // Later: nodemailer / sendgrid / ses

    this.logger.log('📧 Email queued');
    this.logger.log(JSON.stringify(payload, null, 2));

    // DO NOT throw here
    // Notifications must never break payments
  }
}
