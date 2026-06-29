import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAirportTransferDto } from './dto/create-airport-transfer.dto';
import { NotificationService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import {
  AirportTransfer,
  AirportTransferDocument,
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

      await this.sendNotifications(saved.toObject());

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
