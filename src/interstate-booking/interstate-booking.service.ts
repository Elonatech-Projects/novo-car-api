// src/interstate-booking/interstate-booking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import {
  InterstateBooking,
  InterstateBookingDocument,
} from './schema/interstate-booking.schema';
import { CreateInterstateBookingDto } from './dto/create-interstate-booking.dto';
import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class InterstateBookingService {
  private readonly logger = new Logger(InterstateBookingService.name);

  constructor(
    @InjectModel(InterstateBooking.name)
    private readonly model: Model<InterstateBookingDocument>,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateInterstateBookingDto): Promise<{ message: string }> {
    const doc = await this.model.create({
      ...dto,
      email: dto.email.toLowerCase().trim(),
      status: 'pending_review',
    });

    const request = doc.toObject();
    this.logger.log(`New interstate quote request from ${request.email}`);

    // Notify admin
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (adminEmail) {
      this.notificationService
        .sendEmail({
          to: adminEmail,
          subject: `New Interstate Rental Request — ${request.name}`,
          template: 'interstate-booking-admin',
          context: { booking: request },
        })
        .catch((err) =>
          this.logger.error('Failed to send interstate admin email', err),
        );
    }

    // Acknowledge the customer
    this.notificationService
      .sendEmail({
        to: request.email,
        subject: 'We received your interstate rental request',
        template: 'interstate-booking-user',
        context: { booking: request },
      })
      .catch((err) =>
        this.logger.error('Failed to send interstate user email', err),
      );

    return {
      message:
        'Interstate rental request received. Our team will contact you shortly with a quote.',
    };
  }

  async getAll(): Promise<InterstateBooking[]> {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }
}
