// src/pricing/pricing.engine.ts

import {
  PricingRule,
  PricingInput,
  PricingCalculationResult,
} from './pricing.types';

/**
 * SINGLE source of truth for price calculation
 * Never calculate price anywhere else
 */
// pricing.engine.ts
export function calculatePrice(
  rule: PricingRule,
  input: PricingInput,
): PricingCalculationResult {
  let price = rule.baseFare;

  // distance
  if (typeof input.distanceKm === 'number' && rule.perKmRate) {
    const freeKm = rule.freeKm ?? 0;
    const billableKm = Math.max(input.distanceKm - freeKm, 0);
    price += billableKm * rule.perKmRate;
  }

  // passengers
  if (input.passengers && rule.perExtraPassenger && input.passengers > 1) {
    price += (input.passengers - 1) * rule.perExtraPassenger;
  }

  // cars
  if (
    typeof input.numberOfCars === 'number' &&
    rule.perExtraCar &&
    input.numberOfCars > 1
  ) {
    price += (input.numberOfCars - 1) * rule.perExtraCar;
  }

  const surgeMultiplier = input.surgeMultiplier ?? 1;
  price *= surgeMultiplier;

  const serviceCharge = Math.round(price * 0.1);
  const vat = Math.round(price * 0.075);

  return {
    baseFare: Math.round(price),
    serviceCharge,
    vat,
    surgeMultiplier,
    total: Math.round(price + serviceCharge + vat),
  };
}
