export type EmailPayload = BookingConfirmationEmail | ShuttleConfirmationEmail;

export interface BaseEmail {
  to: string;
  subject: string;
}

export interface BookingConfirmationEmail extends BaseEmail {
  type: 'BOOKING_CONFIRMATION';
  data: {
    reference: string;
    route: string;
    travelDate: string;
    passengers: number;
    amountPaid: number;
  };
}

export interface ShuttleConfirmationEmail extends BaseEmail {
  type: 'SHUTTLE_CONFIRMATION';
  data: {
    reference: string;
    shuttleType: string;
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    distanceKm: number;
    amountPaid: number;
  };
}
