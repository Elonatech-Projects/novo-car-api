// src/notifications/notification.module.ts

import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { NotificationService } from './notifications.service';
// import { SmsService } from './sms.service';
import { SmsService } from './sms/sms.service';
@Module({
  imports: [MailModule],
  providers: [NotificationService, SmsService],
  exports: [NotificationService, SmsService],
})
export class NotificationsModule {}
