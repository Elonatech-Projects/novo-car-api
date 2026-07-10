import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAirportTransferDto } from './dto/create-airport-transfer.dto';
import { NotificationService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import {
  AirportTransfer,
  AirportTransferDocument,
  AirportTransferStatus,
} from './schema/airport-transfer.schema';

// In-memory duplicate guard — resets on server restart (acceptable for now)
const recentBookings = new Map<string, number>();
const DUPLICATE_WINDOW = 15 * 60 * 1000; // 15 mins

@Injectable()
export class AirportTransferService {
  private readonly logger = new Logger(AirportTransferService.name);

  constructor(
    @InjectModel(AirportTransfer.name)
    private readonly airportTransferModel: Model<AirportTransferDocument>,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateAirportTransferDto) {
    try {
      const key = `${dto.email}-${dto.date}-${dto.airport}-${dto.vehicle}`;
      const now = Date.now();

      // Duplicate check
      const lastRequest = recentBookings.get(key);
      if (lastRequest && now - lastRequest < DUPLICATE_WINDOW) {
        return {
          message: 'Duplicate booking detected. Please wait before retrying.',
        };
      }

      recentBookings.set(key, now);

      // Persist the booking so admins can review it later.
      const saved = await this.airportTransferModel.create({
        ...dto,
        email: dto.email.toLowerCase().trim(),
        status: 'pending_review',
      });

      this.logger.log(`Airport transfer booking saved: ${saved._id}`);

      // Fire-and-forget — the booking is already persisted, so a mail outage or
      // a hanging SMTP call (e.g. no Brevo key locally) must NEVER block or fail
      // the request. Notifications run in the background.
      void this.sendNotifications(saved.toObject()).catch((err: unknown) => {
        this.logger.error(
          'Airport transfer notifications failed',
          err instanceof Error ? err.stack : String(err),
        );
      });

      return { message: 'Airport transfer booking received successfully' };
    } catch (error) {
      this.logger.error(
        'Airport booking error',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to process airport transfer booking',
      );
    }
  }

  // Admin — list all airport transfer bookings (newest first).
  async getAll(): Promise<AirportTransfer[]> {
    return this.airportTransferModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Admin — update the review status. Only fires the approval email on the
  // transition INTO 'approved' — not on every save while already approved
  // (e.g. an admin editing another field later shouldn't re-notify).
  async updateStatus(
    id: string,
    status: AirportTransferStatus,
  ): Promise<AirportTransfer> {
    const booking = await this.airportTransferModel.findById(id);

    if (!booking) {
      throw new NotFoundException('Airport transfer booking not found');
    }

    const wasApproved = booking.status === 'approved';
    booking.status = status;
    await booking.save();

    this.logger.log(`Airport transfer ${id} status set to: ${status}`);

    if (status === 'approved' && !wasApproved) {
      const saved = booking.toObject();
      void this.notificationService
        .sendEmail({
          to: saved.email,
          subject: 'Your Airport Transfer Has Been Approved',
          template: 'airport-booking-approved',
          context: {
            name: saved.name,
            airport: saved.airport,
            terminal: saved.terminal,
            date: saved.date,
            pickupTime: saved.pickupTime,
            pickupLocation: saved.pickupLocation,
            vehicle: saved.vehicle,
          },
        })
        .catch((err: unknown) => {
          this.logger.error(
            'Failed to send airport transfer approval email',
            err instanceof Error ? err.stack : String(err),
          );
        });
    }

    return booking.toObject();
  }

  private async sendNotifications(booking: AirportTransfer) {
    // User confirmation email
    await this.notificationService.sendEmail({
      to: booking.email,
      subject: 'Airport Transfer Booking Received',
      template: 'airport-booking-user',
      context: {
        name: booking.name,
        airport: booking.airport,
        terminal: booking.terminal,
        date: booking.date,
        vehicle: booking.vehicle,
      },
    });

    // Admin alert email
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      // Config missing — log and skip rather than throwing so user booking still succeeds
      this.logger.warn(
        'ADMIN_EMAIL not configured — skipping admin notification for airport transfer',
      );
      return;
    }

    this.notificationService
      .sendEmail({
        to: adminEmail,
        subject: 'New Airport Transfer Booking',
        template: 'airport-booking-admin',
        context: { ...booking },
      })
      .catch((err: unknown) => {
        this.logger.error(
          'Failed to send airport booking admin notification',
          err instanceof Error ? err.stack : String(err),
        );
      });
  }
}
