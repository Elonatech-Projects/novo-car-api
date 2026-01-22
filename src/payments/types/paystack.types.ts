export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
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
  };
}

export interface PaystackMetadata {
  bookingId?: string;
  [key: string]: any;
}

export interface PaystackCustomer {
  email: string;
  [key: string]: unknown;
}
/**
 * Generic Paystack error response
 * (Paystack usually returns { status, message })
 */
export interface PaystackErrorResponse {
  status: boolean;
  message: string;
}
