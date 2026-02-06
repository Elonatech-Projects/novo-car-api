// src/pricing/pricing.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pricing, PricingDocument } from './pricing.schema';
import { PricingInput } from './pricing.types';
import { calculatePrice } from './pricing.engine';

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing.name)
    private readonly pricingModel: Model<PricingDocument>,
  ) {}

  async estimate(input: PricingInput) {
    const rule = await this.pricingModel.findOne({
      shuttleType: input.shuttleType,
      isActive: true,
    });

    if (!rule) {
      throw new BadRequestException('Pricing not configured for this service');
    }

    return calculatePrice(rule, input);
  }
}
