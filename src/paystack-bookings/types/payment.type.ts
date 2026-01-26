export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
  TRANSFER = 'transfer',
  PAYSTACK = 'paystack',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface BookingPayment {
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  verified: boolean;

  reference?: string;
  paystackReference?: string;
  verifiedAt?: Date;
}
