export enum ShuttleBookingStatus {
  // PENDING = 'pending',
  RESERVED = 'reserved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export type ShuttleTripType = 'one-way' | 'round-trip';
