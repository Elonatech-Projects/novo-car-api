// src\shuttle-services\shuttle-service-cleanup.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Shuttle, ShuttleDocument } from './schema/shuttle-service.schema';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ShuttleServiceCleanupService {
  // This service will be responsible for cleaning up expired shuttle bookings
  // It can be scheduled to run periodically (e.g., every hour) using a cron job
  constructor(
    @InjectModel(Shuttle.name) private shuttleModel: Model<ShuttleDocument>,
  ) {}

  //   This method will delete all shuttle bookings that have expired (i.e., current time is past the expiresAt field)
  @Cron(CronExpression.EVERY_MINUTE)
  async expireReservations(): Promise<void> {
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
  }
}
