import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { CreateScheduleConsultationDto } from './dto/create-schedule-consultation.dto';
import { UpdateScheduleConsultationDto } from './dto/update-schedule-consultation.dto';
import {
  ScheduleConsultation,
  ScheduleConsultationDocument,
} from './schema/schedule-consultation.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ScheduleConsultationService {
  private readonly logger = new Logger(ScheduleConsultationService.name);

  constructor(
    @InjectModel(ScheduleConsultation.name)
    private readonly consultationModel: Model<ScheduleConsultationDocument>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateScheduleConsultationDto) {
    const created = await this.consultationModel.create(dto);

    /* ---------- USER EMAIL ----------- */
    try {
      await this.mailService.sendTemplateEmail(
        dto.email,
        'Consultation Request Received - Novo Cars',
        'schedule-consultation',
        { ...dto },
      );
      this.logger.log('Consultation confirmation email sent to user');
    } catch (error) {
      this.logger.error('Failed to send consultation email to user', error);
    }

    /* ---------- ADMIN EMAIL ----------- */
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured — skipping admin email.');
    } else {
      try {
        await this.mailService.sendTemplateEmail(
          adminEmail,
          'New Consultation Request - Novo Cars',
          'schedule-consultation-admin',
          { ...dto },
        );
        this.logger.log('Consultation admin email sent');
      } catch (error) {
        this.logger.error('Failed to send consultation admin email', error);
      }
    }

    return {
      success: true,
      message: 'Consultation request submitted successfully',
      data: created,
    };
  }

  findAll() {
    return this.consultationModel.find().sort({ createdAt: -1 }).exec();
  }

  findOne(id: string) {
    return this.consultationModel.findById(id).exec();
  }

  update(id: string, dto: UpdateScheduleConsultationDto) {
    return this.consultationModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.consultationModel.findByIdAndDelete(id).exec();
  }
}
