// src/payments/types/paystack-webhook.type.ts

export interface PaystackWebhookEvent {
  event: string;
  data: {
    amount: number;
    reference: string;
    status?: 'success' | 'failed';
    paid_at?: string;
    currency?: string;
    customer?: {
      email?: string;
    };
    metadata?: {
      source?: 'booking' | 'shuttle-booking';
      sourceId?: string;
    };
  };
}

export interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: 'success' | 'failed' | 'abandoned';
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
