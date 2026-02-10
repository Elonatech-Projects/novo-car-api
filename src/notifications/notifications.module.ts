import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { EmailModule } from './email/email.module';

@Module({
  imports: [EmailModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
