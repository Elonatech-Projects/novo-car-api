// Paystack Service: Manages Paystack payment gateway interactions.
// paystack.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import {
  PaystackInitializeResponse,
  PaystackVerifyResponse,
  PaystackErrorResponse,
} from './types/paystack.types';

@Injectable()
export class PaystackService {
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!key) {
      throw new Error(
        'PAYSTACK_SECRET_KEY is not defined in environment variables',
      );
    }

    this.secretKey = key;
  }

  /**
   * Initialize Paystack transaction
   */
  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaystackInitializeResponse> {
    try {
      const response = await axios.post<PaystackInitializeResponse>(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: data.email,
          amount: data.amount,
          reference: data.reference,
          metadata: data.metadata,
          callback_url:
            data.callbackUrl ??
            `${this.configService.get<string>('FRONTEND_URL')}/booking/verify-payment`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (err: unknown) {
      throw this.handleAxiosError(err, 'Paystack initialization failed');
    }
  }

  /**
   * Verify Paystack transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await axios.get<PaystackVerifyResponse>(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return response.data;
    } catch (err: unknown) {
      throw this.handleAxiosError(err, 'Payment verification failed');
    }
  }

  /**
   * CENTRALIZED AXIOS ERROR HANDLER
   * - No any
   * - No unsafe access
   * - Reusable
   */
  private handleAxiosError(
    err: unknown,
    fallbackMessage: string,
  ): HttpException {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<PaystackErrorResponse>;

      const message = axiosError.response?.data?.message ?? fallbackMessage;

      return new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    return new HttpException(fallbackMessage, HttpStatus.BAD_REQUEST);
  }
}
