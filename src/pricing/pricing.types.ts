import { ShuttleType } from '../shuttle-booking/enums';

// export interface PricingInput {
//   shuttleType: ShuttleType;

//   // Common
//   passengers?: number;

//   // Distance (future – Google Maps)
//   distanceKm?: number;

//   // Wedding / Event
//   numberOfCars?: number;
// }

export interface PricingRule {
  shuttleType: ShuttleType;

  baseFare: number;

  perKmRate?: number;
  freeKm?: number;

  perExtraPassenger?: number;
  perExtraCar?: number;

  trafficMultiplier?: number;
}

export interface PricingResult {
  baseFare: number;
  serviceCharge: number;
  vat: number;
  total: number;
}

export interface PricingInput {
  shuttleType: ShuttleType;
  passengers?: number;
  numberOfCars?: number;
  distanceKm?: number;
  surgeMultiplier?: number;
}

export interface PricingCalculationResult {
  baseFare: number;
  serviceCharge: number;
  vat: number;
  surgeMultiplier?: number;
  total: number;
}
