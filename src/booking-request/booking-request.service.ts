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
import { SmsService } from '../notifications/sms/sms.service';
import { UpdateBookingRequestDto } from './dto/update-booking-request.dto';

@Injectable()
export class BookingRequestService {
  private readonly logger = new Logger(BookingRequestService.name);
  private readonly companySender: string;
  private readonly companyPhone: string;

  constructor(
    @InjectModel(BookingRequest.name)
    private readonly bookingModel: Model<BookingRequestDocument>,

    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {
    this.companySender =
      this.configService.get<string>('TERMII_SENDER_ID_COMPANY') ?? 'Novo';
    this.companyPhone =
      this.configService.get<string>('NOVO_COMPANY_PHONE') ?? '2349072711009';
  }

  async create(dto: CreateBookingRequestDto): Promise<void> {
    // Guard against duplicate submissions: the frontend's fetch has no
    // retry of its own, but a slow/cold-start backend response combined
    // with a flaky mobile connection can still cause the same request to
    // be sent twice. Treat a matching request submitted in the last 5
    // minutes as the same request rather than creating a second booking
    // and re-sending duplicate admin/user emails + SMS.
    const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

    const existing = await this.bookingModel
      .findOne({
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        shuttleType: dto.shuttleType,
        bookingDate: dto.bookingDate,
        pickupTime: dto.pickupTime,
        createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      })
      .lean()
      .exec();

    if (existing) {
      this.logger.log(
        `Duplicate booking request suppressed for ${dto.email} (${dto.shuttleType}, ${dto.bookingDate} ${dto.pickupTime})`,
      );
      return;
    }

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

    // SMS notification to internal ops team
    try {
      const smsMessage = `New booking request from ${request.firstName} (${request.email}) for ${request.shuttleType} shuttle by ${request.bookingDate} at ${request.pickupLocation}.`;

      await this.smsService.sendSMS(
        [this.companyPhone], // Novo Cars internal ops phone
        smsMessage,
        this.companySender,
      );

      this.logger.log(
        `Shuttle Booking request SMS notification sent to (${this.companyPhone})`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send shuttle booking request SMS notification',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async getAll(): Promise<BookingRequest[]> {
    return this.bookingModel
      .find()
      .sort({ createdAt: -1 }) // newest first
      .lean()
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.bookingModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(
    id: string,
    update: UpdateBookingRequestDto,
  ): Promise<BookingRequest | null> {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean()
      .exec();

    if (!updated) {
      this.logger.warn(
        `Booking request with ID ${id} not found for status update`,
      );
      return null;
    }

    this.logger.log(
      `Updated booking request ${id} to status: ${updated.status}`,
    );

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.bookingModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      this.logger.warn(`Booking request with ID ${id} not found for deletion`);
    } else {
      this.logger.log(`Deleted booking request with ID ${id}`);
    }
    return { message: 'Booking request deleted successfully' };
  }
}
