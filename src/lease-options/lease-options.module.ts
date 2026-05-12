import { Module } from '@nestjs/common';
import { LeaseOptionsService } from './lease-options.service';
import { LeaseOptionsController } from './lease-options.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailService } from '../mail/mail.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LeaseConsultation,
  LeaseConsultationSchema,
} from './schema/lease-consultation.schema';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: LeaseConsultation.name, schema: LeaseConsultationSchema },
    ]),
  ],
  controllers: [LeaseOptionsController],
  providers: [LeaseOptionsService, MailService],
})
export class LeaseOptionsModule {}
