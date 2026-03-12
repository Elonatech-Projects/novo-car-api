import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  //   TooManyRequestsException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ODSchool, ODSchoolDocument } from './schema/od-school.schema';
import { CreateODSchoolDto } from './dto/od-school.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { getPackageById } from './config/od-packages';

@Injectable()
export class OdSchoolService {
  private readonly logger = new Logger(OdSchoolService.name);

  constructor(
    @InjectModel(ODSchool.name)
    private readonly odModel: Model<ODSchoolDocument>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async createODSchool(dto: CreateODSchoolDto, ip: string): Promise<ODSchool> {
    try {
      /* -----------------------------
         PACKAGE VALIDATION
      ----------------------------- */

      const pkg = getPackageById(dto.packageId);

      if (!pkg) {
        throw new ConflictException('Invalid package selected');
      }

      /* -----------------------------
         IP SPAM CHECK
      ----------------------------- */

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const recentRequests = await this.odModel.countDocuments({
        ipAddress: ip,
        createdAt: { $gte: fiveMinutesAgo },
      });

      if (recentRequests >= 3) {
        throw new ForbiddenException(
          'Too many booking attempts. Please try again later.',
        );
      }

      /* -----------------------------
         DUPLICATE BOOKING CHECK
      ----------------------------- */

      const duplicate = await this.odModel.findOne({
        preferredDate: dto.preferredDate,
        preferredTime: dto.preferredTime,
        $or: [{ email: dto.email }, { phone: dto.phone }],
        isArchived: false,
      });

      if (duplicate) {
        throw new ConflictException('You already have a booking for this slot');
      }

      /* -----------------------------
         SAVE BOOKING
      ----------------------------- */

      const booking = new this.odModel({
        ...dto,
        ipAddress: ip,
      });

      const savedBooking = await booking.save();

      /* -----------------------------
         SEND EMAILS (ASYNC)
      ----------------------------- */

      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

      if (adminEmail) {
        this.mailService
          .sendTemplateEmail(
            adminEmail,
            'New Orange Driving School Booking',
            'od-school-admin',
            { ...dto, bookingReference: savedBooking.bookingReference },
          )
          .catch((error) => this.logger.warn('Admin email failed', error));
      }

      this.mailService
        .sendTemplateEmail(
          dto.email,
          'Your Driving Lesson Booking Confirmation',
          'od-school-student',
          {
            ...dto,
            packageName: pkg.name,
            bookingReference: savedBooking.bookingReference,
          },
        )
        .catch((error) => this.logger.warn('Student email failed', error));

      return savedBooking;
    } catch (error) {
      this.logger.error('OD booking creation failed', error);

      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to submit booking');
    }
  }
}
