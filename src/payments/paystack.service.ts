// Paystack Service
//src/payments/paystack.service
// import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import {
  PaystackInitializeResponse,
  PaystackVerifyResponse,
  PaystackErrorResponse,
  PaystackRefundResponse,
} from './types/paystack.types';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(
    private readonly configService: ConfigService,
    // private readonly httpService: HttpService,
  ) {
    const key = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!key) {
      throw new Error(
        'PAYSTACK_SECRET_KEY is not defined in environment variables',
      );
    }

    this.secretKey = key;
  }

  //initialize Transaction
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
            `${this.configService.get<string>(
              'FRONTEND_URL',
            )}/booking/verify-payment`,
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

  async refundTransaction(payload: {
    reference: string;
    amount?: number; // kobo
  }): Promise<PaystackRefundResponse> {
    try {
      const response = await axios.post<PaystackRefundResponse>(
        `${this.baseUrl}/refund`,
        {
          transaction: payload.reference,
          amount: payload.amount,
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
      throw this.handleAxiosError(err, 'Refund request failed');
    }
  }

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
  async verifyRefund(reference: string): Promise<{
    status: 'pending' | 'failed' | 'processed';
  }> {
    try {
      const response = await axios.get<{
        status: boolean;
        data: { status: 'pending' | 'failed' | 'processed' };
      }>(`${this.baseUrl}/refund/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      return response.data.data;
    } catch (err: unknown) {
      throw this.handleAxiosError(err, 'Refund verification failed');
    }
  }
}
// paystack.service.ts
