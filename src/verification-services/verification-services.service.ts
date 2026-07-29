import { Injectable, Logger } from '@nestjs/common';
import {
  VerificationService,
  VerificationServiceDocument,
} from './schema/verification-services.schema';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { CreateVerificationServicesDto } from './dto/verification-services.dto';
import { AuditService } from '../audit/audit.service';
import { logAdminNotificationFailure } from '../common/utils/admin-notification-failure';

@Injectable()
export class VerificationServicesService {
  private readonly logger: Logger = new Logger(
    VerificationServicesService.name,
  );
  constructor(
    @InjectModel(VerificationService.name)
    private readonly verificationServiceModel: Model<VerificationServiceDocument>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  async createVerificationRequest(
    dto: CreateVerificationServicesDto,
  ): Promise<VerificationServiceDocument> {
    const newRequest = new this.verificationServiceModel(dto);
    const savedRequest = await newRequest.save();
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    //   Email notification to admin about new verification request
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured — skipping admin email.');
    } else {
      try {
        await this.mailService.sendTemplateEmail(
          adminEmail,
          'New Verification Service Request',
          'verification-service-admin',
          { ...dto },
        );
        this.logger.log(`Notification email sent to admin: ${adminEmail}`);
      } catch (error) {
        await logAdminNotificationFailure(this.auditService, this.logger, {
          context: 'verification-services',
          channel: 'email',
          recipient: adminEmail,
          subject: 'New Verification Service Request',
          error,
        });
      }
    }

    //   Acknowledgment email to the requester
    try {
      await this.mailService.sendTemplateEmail(
        dto.email,
        'Your Verification Request Has Been Received - Novo Cars',
        'verification-service-user',
        { ...dto },
      );
      this.logger.log(`Confirmation email sent to requester: ${dto.email}`);
    } catch (error) {
      this.logger.error('Failed to send confirmation email:', error);
    }

    return savedRequest;
  }
}
