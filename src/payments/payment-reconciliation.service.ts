// src/payments/payment-reconciliation.service.ts
//
// Safety net for the gap identified in the money/booking QA sweep: if a
// Paystack webhook silently fails (network blip, DB hiccup) and the customer
// never revisits the manual /payment/verify?reference= page, the booking is
// stuck unpaid forever with no automated recovery.
//
// This job periodically re-checks bookings that have a Paystack reference
// but are still unpaid, using the SAME verifyPayment() path already trusted
// for the manual fallback — so amount-matching and idempotency guards are
// reused rather than reimplemented.
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PaymentsService } from './payments.service';
import { UserBooking } from '../booking/schema/user-booking.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';
import {
  Shuttle,
  ShuttleDocument,
} from '../shuttle-services/schema/shuttle-service.schema';
import { ShuttleBookingStatus } from '../common/enums/shuttle-booking.enum';

// Give the webhook a fair chance to arrive on its own before we bother
// Paystack again — anything younger than this is just "still in flight".
const MIN_AGE_MS = 10 * 60 * 1000; // 10 minutes

// Don't keep re-checking abandoned carts forever — a booking still unpaid
// after this long is almost certainly a genuine abandonment, not a missed
// webhook, and re-verifying it every run just wastes Paystack API calls.
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

@Injectable()
export class PaymentReconciliationService {
  private readonly logger = new Logger(PaymentReconciliationService.name);

  constructor(
    @InjectModel(UserBooking.name)
    private readonly bookingModel: Model<UserBooking>,

    @InjectModel(Shuttle.name)
    private readonly shuttleServicesModel: Model<ShuttleDocument>,

    private readonly paymentsService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async reconcile(): Promise<void> {
    // This job is itself the safety net for missed Paystack webhooks — if it
    // silently stops running (an unguarded DB error), the one thing designed
    // to catch other silent failures goes dark unnoticed. Wrap each half
    // independently so a failure in one doesn't also cancel the other, and
    // log loudly rather than letting a rejection vanish into an unhandled
    // promise rejection.
    try {
      await this.reconcileBookings();
    } catch (error) {
      this.logger.error(
        `Booking payment reconciliation failed this run: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    try {
      await this.reconcileShuttleServices();
    } catch (error) {
      this.logger.error(
        `Shuttle payment reconciliation failed this run: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async reconcileBookings(): Promise<void> {
    const now = Date.now();

    const stuck = await this.bookingModel
      .find({
        paymentReference: { $exists: true, $ne: null },
        status: BookingStatus.PENDING_PAYMENT,
        createdAt: {
          $lte: new Date(now - MIN_AGE_MS),
          $gte: new Date(now - MAX_AGE_MS),
        },
      })
      .select('_id paymentReference')
      .lean()
      .exec();

    if (stuck.length === 0) return;

    this.logger.log(
      `Reconciliation: checking ${stuck.length} pending booking payment(s)`,
    );

    for (const booking of stuck) {
      await this.verifyOne(booking.paymentReference!, booking._id.toString());
    }
  }

  private async reconcileShuttleServices(): Promise<void> {
    const now = Date.now();

    const stuck = await this.shuttleServicesModel
      .find({
        paymentReference: { $exists: true, $ne: null },
        paymentVerified: false,
        status: ShuttleBookingStatus.RESERVED,
        createdAt: {
          $lte: new Date(now - MIN_AGE_MS),
          $gte: new Date(now - MAX_AGE_MS),
        },
      })
      .select('_id paymentReference')
      .lean()
      .exec();

    if (stuck.length === 0) return;

    this.logger.log(
      `Reconciliation: checking ${stuck.length} pending shuttle payment(s)`,
    );

    for (const booking of stuck) {
      await this.verifyOne(booking.paymentReference!, booking._id.toString());
    }
  }

  // verifyPayment() throws when Paystack has no successful charge for the
  // reference yet (BadRequestException) — that's the expected, common case
  // (genuinely still unpaid), so we log it quietly and move on rather than
  // letting one failure stop the whole batch.
  private async verifyOne(reference: string, bookingId: string): Promise<void> {
    try {
      const result = await this.paymentsService.verifyPayment(reference);

      if (result?.success) {
        this.logger.warn(
          `Reconciliation recovered a missed payment — booking ${bookingId} (ref ${reference}) was paid but never marked. Now fixed.`,
        );
      }
    } catch (error) {
      this.logger.debug(
        `Reconciliation: booking ${bookingId} (ref ${reference}) still not paid — ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
