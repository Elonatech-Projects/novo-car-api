import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  JobApplication,
  JobApplicationDocument,
} from './schema/job-application.schema';

import { CreateJobApplicationDto } from './dto/create-job-application.dto';

import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class JobApplicationsService {
  private readonly logger = new Logger(JobApplicationsService.name);

  constructor(
    @InjectModel(JobApplication.name)
    private readonly applicationModel: Model<JobApplicationDocument>,

    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Create Job Application
   */
  async create(
    dto: CreateJobApplicationDto,
    cv: Express.Multer.File,
  ): Promise<JobApplication> {
    if (!cv) {
      throw new BadRequestException('CV file is required');
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new InternalServerErrorException('ADMIN_EMAIL is not configured');
    }

    const application = new this.applicationModel({
      ...dto,
      cvFileName: cv.originalname,
    });

    const savedApplication = await application.save();

    /**
     * Run notifications outside request lifecycle
     */
    setImmediate(() => {
      void this.processEmailNotifications(dto, cv, savedApplication.id);
    });

    return savedApplication;
  }

  /**
   * Async Email Worker
   * Handles admin + applicant notifications
   */
  private async processEmailNotifications(
    dto: CreateJobApplicationDto,
    cv: Express.Multer.File,
    applicationId: string,
  ): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured');
      return;
    }

    /** ---------------- ADMIN EMAIL ---------------- */

    try {
      await this.notificationService.sendEmail({
        to: adminEmail,
        subject: `New Job Application - ${dto.jobTitle}`,
        template: 'job-application-admin',
        context: {
          name: `${dto.firstName} ${dto.lastName}`,
          email: dto.email,
          phone: dto.phoneNumber,
          address: dto.address,
          jobTitle: dto.jobTitle,
          coverLetter: dto.coverLetter || 'N/A',
          cvFileName: cv.originalname,
        },
        attachments: [
          {
            filename: cv.originalname,
            content: cv.buffer,
          },
        ],
      });

      this.logger.log(`Admin email sent | applicationId=${applicationId}`);
    } catch (error) {
      this.logger.warn(`Admin email failed | applicationId=${applicationId}`);

      if (error instanceof Error) {
        this.logger.debug(error.stack);
      }
    }

    /** ---------------- APPLICANT EMAIL ---------------- */

    try {
      await this.notificationService.sendEmail({
        to: dto.email,
        subject: `Application Received - ${dto.jobTitle}`,
        template: 'job-application-confirmation',
        context: {
          name: dto.firstName,
          jobTitle: dto.jobTitle,
        },
      });

      this.logger.log(
        `Applicant confirmation sent | applicationId=${applicationId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Applicant email failed | applicationId=${applicationId}`,
      );

      if (error instanceof Error) {
        this.logger.debug(error.stack);
      }
    }
  }

  /**
   * Admin: Fetch all applications
   */
  async findAll(): Promise<JobApplication[]> {
    return this.applicationModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Admin: Fetch single application
   */
  async findOne(id: string): Promise<JobApplication | null> {
    return this.applicationModel.findById(id).exec();
  }
}
