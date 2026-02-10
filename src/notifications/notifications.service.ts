import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Injectable()
export class NotificationService {
  constructor(private readonly emailService: EmailService) {}

  async paymentConfirmed(payload: {
    source: 'booking' | 'shuttle-booking';
    emailData: any;
  }) {
    setImmediate(async () => {
      await this.emailService.send(payload.emailData);
    });
  }

  async refundInitiated(payload: {
    source: 'booking' | 'shuttle-booking';
    emailData: any;
  }) {
    setImmediate(async () => {
      await this.emailService.send(payload.emailData);
    });
  }

  async refundCompleted(payload: {
    source: 'booking' | 'shuttle-booking';
    emailData: any;
  }) {
    setImmediate(async () => {
      await this.emailService.send(payload.emailData);
    });
  }
}
