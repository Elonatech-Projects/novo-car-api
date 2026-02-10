// Paystack Types
// src/payments/types/paystack.types.ts
export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackTransactionData {
  id: number;
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amount: number;
  paid_at: string;
  channel: string;
  currency: string;
  customer: {
    email: string;
  };
  metadata?: {
    bookingId?: string;
    [key: string]: any;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: PaystackTransactionData;
}

export interface PaystackErrorResponse {
  status: boolean;
  message: string;
}

export interface PaystackRefundResponse {
  status: boolean;
  message: string;
  data: {
    transaction: {
      reference: string;
    };
    status: 'pending' | 'processed' | 'failed';
  };
}
