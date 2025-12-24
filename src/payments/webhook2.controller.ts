import {
  Controller,
  Post,
  BadRequestException,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentMethod, PaymentStatus } from '../bookings/types/payment.type';

interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number; // in kobo
    status: 'success' | 'failed';
    metadata?: {
      bookingReference?: string;
    };
  };
}

@Controller('payments/webhook')
export class PaystackWebhookController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async handleWebhook(req: RawBodyRequest<Request>) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers["x-paystack-signature"]

    if (!secret) {
      throw new BadRequestException("Paystack secret key not configured")
    }

    if (!signature) {
      throw new BadRequestException("Missing x-paystack-signature header")
    }

    const bodyForVerification = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body)

    const hash = crypto.createHmac("sha512", secret).update(bodyForVerification).digest("hex")

    if (hash !== signature) {
      throw new BadRequestException("Invalid webhook signature")
    }

    const payload: PaystackWebhookPayload = req.rawBody ? JSON.parse(req.rawBody.toString("utf8")) : req.body

    // Only handle successful charge events
    if (payload.event !== "charge.success" || payload.data.status !== "success") {
      return { received: true }
    }

    const bookingReference = payload.data.metadata?.bookingReference

    if (!bookingReference) {
      throw new BadRequestException("bookingReference missing in Paystack metadata")
    }

    await this.bookingsService.updatePayment(bookingReference, {
      method: PaymentMethod.PAYSTACK, // Use your PaymentMethod enum value
      amount: payload.data.amount / 100, // kobo → naira
      status: PaymentStatus.SUCCESS, // Use your PaymentStatus enum value
      verified: true,
      reference: payload.data.reference,
      paystackReference: payload.data.reference,
    })

    return { received: true }
  }
}
