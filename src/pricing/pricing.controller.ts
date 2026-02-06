// src/pricing/pricing-controller
import { Controller, Post, Body } from '@nestjs/common';
import { PricingService } from './pricing.service';
import type { PricingInput } from './pricing.types'; // 👈 type-only import

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('estimate')
  estimate(@Body() body: PricingInput) {
    return this.pricingService.estimate(body);
  }
}
