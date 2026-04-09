export enum ShuttleBookingStatus {
  // Seat is reserved, awaiting payment. Expires after 15 minutes.
  RESERVED = 'reserved',

  // Payment confirmed — either via webhook or manual verify.
  PAID = 'paid',

  // Reservation window expired before payment was received.
  EXPIRED = 'expired',

  // Payment was received AFTER the booking expired.
  // A Paystack refund has been triggered. Awaiting Paystack confirmation.
  REFUND_PENDING = 'refund_pending',

  // Refund successfully processed by Paystack.
  REFUNDED = 'refunded',

  // Booking was cancelled by the user or admin before payment.
  CANCELLED = 'cancelled',
}

export type ShuttleTripType = 'one-way' | 'round-trip';
