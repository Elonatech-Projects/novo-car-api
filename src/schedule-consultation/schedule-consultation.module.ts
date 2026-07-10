import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleConsultationService } from './schedule-consultation.service';
import { ScheduleConsultationController } from './schedule-consultation.controller';
import { MailService } from '../mail/mail.service';
import {
  ScheduleConsultation,
  ScheduleConsultationSchema,
} from './schema/schedule-consultation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleConsultation.name, schema: ScheduleConsultationSchema },
    ]),
  ],
  controllers: [ScheduleConsultationController],
  providers: [ScheduleConsultationService, MailService],
})
export class ScheduleConsultationModule {}
