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
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class JobApplicationsService {
  private readonly logger = new Logger(JobApplicationsService.name);

  constructor(
    @InjectModel(JobApplication.name)
    private readonly applicationModel: Model<JobApplicationDocument>,

    private readonly notificationService: NotificationService,

    private readonly cloudinaryService: CloudinaryService,
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

    const uploadResult = await this.cloudinaryService.uploadFile(cv);
    // console.log('Uploading CV...', uploadResult);

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new InternalServerErrorException('ADMIN_EMAIL is not configured');
    }

    const application = new this.applicationModel({
      ...dto,
      cvFileName: cv.originalname,
      cvUrl: uploadResult.secure_url,
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
    return this.applicationModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  /**
   * Admin: Fetch single application
   */
  async findOne(id: string): Promise<JobApplication | null> {
    return this.applicationModel.findById(id).lean().exec();
  }

  // Admin: Update application status (e.g. pending, reviewed, rejected, accepted)
  async updateStatus(
    id: string,
    status: string,
  ): Promise<JobApplication | null> {
    const validStatuses = ['pending', 'reviewed', 'rejected', 'accepted'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status value');
    }

    return this.applicationModel
      .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .lean()
      .exec();
  }

  // Admin: Search applications by jobId and status
  async findByJobIdAndStatus(
    jobId: string,
    status: string,
  ): Promise<JobApplication[]> {
    return this.applicationModel
      .find({
        jobId,
        status,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Admin: Search applications by applicant email
  async findByEmail(email: string): Promise<JobApplication[]> {
    return this.applicationModel
      .find({
        email,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Admin: Search applications by status
  async findByStatus(status: string): Promise<JobApplication[]> {
    return this.applicationModel
      .find({
        status,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Delete an application (admin only)
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.applicationModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new BadRequestException('Application not found');
    }

    return { success: true, message: 'Application deleted successfully' };
  }
}
