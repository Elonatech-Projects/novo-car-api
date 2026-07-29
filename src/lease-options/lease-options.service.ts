// src/lease-options/lease-options.service.ts

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import {
  LeaseConsultation,
  LeaseConsultationDocument,
} from './schema/lease-consultation.schema';

import { CreateLeaseConsultationDto } from './dto/create-lease-option.dto';
import { NotificationService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { logAdminNotificationFailure } from '../common/utils/admin-notification-failure';

@Injectable()
export class LeaseOptionsService {
  private readonly logger = new Logger(LeaseOptionsService.name);

  constructor(
    @InjectModel(LeaseConsultation.name)
    private leaseModel: Model<LeaseConsultationDocument>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async handleConsultation(dto: CreateLeaseConsultationDto) {
    const { vehicles } = dto;

    // 🔹 Basic validation (business sanity check)
    if (vehicles < 1) {
      throw new BadRequestException('Number of vehicles must be at least 1');
    }

    const leaseData = {
      ...dto,
      company: dto.company || '',
    };

    // 🔹 Save to DB
    const createdLease = await this.leaseModel.create(leaseData);

    /* ---------- USER EMAIL ----------- */
    try {
      await this.notificationService.sendEmail({
        to: dto.email,
        subject: 'Leasing Consultation Request Received - Novo Cars',
        template: 'leasing-consultation',
        context: { ...dto },
      });

      this.logger.log('Leasing email sent to user');
    } catch (error) {
      this.logger.error('Failed to send leasing email to user', error);

      if (error instanceof Error) {
        this.logger.debug(error.stack);
      }
    }

    /* ---------- ADMIN EMAIL ----------- */
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured — skipping admin email.');
    } else {
      try {
        await this.mailService.sendTemplateEmail(
          adminEmail,
          'New Leasing Consultation Request - Novo Cars',
          'leasing-consultation-admin',
          { ...dto },
        );

        this.logger.log('Leasing admin email sent');
      } catch (error) {
        await logAdminNotificationFailure(this.auditService, this.logger, {
          context: 'lease-options',
          channel: 'email',
          recipient: adminEmail,
          subject: 'New Leasing Consultation Request - Novo Cars',
          error,
        });
      }
    }

    return {
      success: true,
      message: 'Leasing consultation submitted successfully',
      data: createdLease,
    };
  }
}
