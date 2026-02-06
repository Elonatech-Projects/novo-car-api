export interface PaystackWebhookEvent {
  event: string;
  data: {
    amount: number;
    reference: string;
    paid_at?: string;
    metadata?: {
      source?: 'booking' | 'shuttle-booking';
      sourceId?: string;
    };
  };
}
