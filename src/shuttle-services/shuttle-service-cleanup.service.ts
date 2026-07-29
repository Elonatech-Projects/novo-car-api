// src\shuttle-services\shuttle-service-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Shuttle, ShuttleDocument } from './schema/shuttle-service.schema';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ShuttleServiceCleanupService {
  private readonly logger = new Logger(ShuttleServiceCleanupService.name);

  // This service will be responsible for cleaning up expired shuttle bookings
  // It can be scheduled to run periodically (e.g., every hour) using a cron job
  constructor(
    @InjectModel(Shuttle.name) private shuttleModel: Model<ShuttleDocument>,
  ) {}

  //   This method will delete all shuttle bookings that have expired (i.e., current time is past the expiresAt field)
  @Cron(CronExpression.EVERY_MINUTE)
  async expireReservations(): Promise<void> {
    // Previously unguarded — a single DB hiccup would reject this promise
    // with nothing but an unhandled-rejection stack trace, giving no clear
    // signal that reservation expiry silently stopped running. The cron
    // still fires again next minute regardless, but we want a loud, clearly
    // tagged log line if a run fails, not a swallowed rejection.
    try {
      const now = new Date();
      await this.shuttleModel.updateMany(
        {
          status: 'reserved',
          expiresAt: { $lt: now },
        },
        {
          $set: { status: 'expired' },
        },
      );
    } catch (error) {
      this.logger.error(
        `Reservation expiry cron failed — expired reservations may be stale until the next successful run: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
