export type SchedulePlanInput = {
  key: string;
  label: string;
  trips: number;
  price: number;
};

export type UpdateSchedulePayload = {
  departureTime?: string;
  capacity?: number;
  basePrice?: number;
  operatingDays?: string[];
  name?: string;
  vehicle?: string;
  vehicleImages?: string[];
  plans?: SchedulePlanInput[];
};
