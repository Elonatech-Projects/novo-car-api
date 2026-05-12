// booking-request.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  BookingRequest,
  BookingRequestDocument,
} from './schema/booking-request.schema';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { NotificationService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookingRequestService {
  private readonly logger = new Logger(BookingRequestService.name);

  constructor(
    @InjectModel(BookingRequest.name)
    private readonly bookingModel: Model<BookingRequestDocument>,

    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateBookingRequestDto): Promise<void> {
    const requestDoc = await this.bookingModel.create({
      ...dto,
      status: 'pending_review',
    });

    const request = requestDoc.toObject();

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    this.logger.log(JSON.stringify(request, null, 2));

    // Admin email
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured');
    } else {
      this.notificationService
        .sendEmail({
          to: adminEmail,
          subject: `New Booking Request - ${request.shuttleType}`,
          template: 'booking-request-admin',
          context: { booking: request },
        })
        .catch((err) => {
          this.logger.error(
            'Failed to send booking request email to admin',
            err,
          );
        });
    }

    // User email
    this.notificationService
      .sendEmail({
        to: request.email,
        subject: 'We received your booking request',
        template: 'booking-request-user',
        context: { booking: request },
      })
      .catch((err) => {
        this.logger.error('Failed to send booking acknowledgement email', err);
      });
  }
}
