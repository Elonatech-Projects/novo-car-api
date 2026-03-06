import { ConflictException, Injectable, Logger } from '@nestjs/common';
import {
  VerificationService,
  VerificationServiceDocument,
} from './schema/verification-services.schema';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { MongoServerError } from 'mongodb';
import { CreateVerificationServicesDto } from './dto/verification-services.dto';

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
  ) {}

  async createVerificationRequest(
    dto: CreateVerificationServicesDto,
  ): Promise<VerificationServiceDocument> {
    try {
      // Create and save with DB-level unique index protection.
      const newRequest = new this.verificationServiceModel(dto);
      const savedRequest = await newRequest.save();
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || '';

      //   Email notification to admin about new verification request
      try {
        await this.mailService.sendTemplateEmail(
          adminEmail,
          'New Verification Service Request',
          'verification-service-admin',
          { ...dto },
        );
        this.logger.log(`Notification email sent to admin: ${adminEmail}`);
      } catch (error) {
        this.logger.error('Failed to send notification email:', error);
      }

      return savedRequest;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        this.logger.warn(
          `Duplicate verification request detected for email: ${dto.email} and company: ${dto.company}`,
        );
        throw new ConflictException(
          'A verification request for this email and company already exists',
        );
      }
      throw error;
    }
  }
}
