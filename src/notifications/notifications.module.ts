// src/notifications/notification.module.ts

import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { NotificationService } from './notifications.service';

@Module({
  imports: [MailModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
