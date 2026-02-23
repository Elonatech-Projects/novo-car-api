// src/payments/types/paystack-webhook.type.ts

export type PaymentSource = 'booking' | 'shuttle-booking' | 'shuttle-services';
export interface PaystackWebhookEvent {
  event: string;
  data: {
    amount: number;
    reference: string;
    paid_at?: string;
    status?: 'success' | 'failed';
    currency?: string;
    customer?: {
      email?: string;
    };
    metadata?: {
      source?: PaymentSource;
      sourceId?: string;
    };
  };
}

export type PaystackWebhookStatus = 'success' | 'failed' | 'abandoned';

export interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: PaystackWebhookStatus;
    metadata?: {
      bookingId?: string;
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
  };
}
