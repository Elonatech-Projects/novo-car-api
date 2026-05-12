import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAirportTransferDto } from './dto/create-airport-transfer.dto';
import { NotificationService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
// Top of file
const recentBookings = new Map<string, number>();
const DUPLICATE_WINDOW = 15 * 60 * 1000; // 15 mins
@Injectable()
export class AirportTransferService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateAirportTransferDto) {
    try {
      // 👉 Normally you'd save to DB here
      const booking = {
        ...dto,
        createdAt: new Date(),
      };
      const key = `${dto.email}-${dto.date}-${dto.airport}-${dto.vehicle}`;
      const now = Date.now();

      // Check duplicate
      const lastRequest = recentBookings.get(key);

      if (lastRequest && now - lastRequest < DUPLICATE_WINDOW) {
        return {
          message: 'Duplicate booking detected. Please wait before retrying.',
        };
      }

      // Save request timestamp
      recentBookings.set(key, now);

      // 🔔 Send emails
      await this.sendNotifications(booking);

      return {
        message: 'Airport transfer booking received successfully',
      };
    } catch (error) {
      console.error('Airport booking error:', error);
      throw new InternalServerErrorException(
        'Failed to process airport transfer booking',
      );
    }
  }

  private async sendNotifications(booking: CreateAirportTransferDto) {
    // 📧 User email
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

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      throw new InternalServerErrorException('Admin email is not configured');
    } else {
      console.warn('Admin email not configured. Skipping admin notification.');
      this.notificationService
        .sendEmail({
          to: adminEmail,
          subject: 'New Airport Transfer Booking',
          template: 'airport-booking-admin',
          context: {
            ...booking,
          },
        })
        .catch((err) => {
          console.error('Failed to send airport booking email to admin', err);
        });
    }
  }
}
