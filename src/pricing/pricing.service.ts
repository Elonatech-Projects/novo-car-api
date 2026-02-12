// src/pricing/pricing.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pricing, PricingDocument } from './pricing.schema';
import { PricingInput } from './pricing.types';
import { calculatePrice } from './pricing.engine';
import { CreatePricingDto } from './dto/create-pricing.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing.name)
    private readonly pricingModel: Model<PricingDocument>,
  ) {}

  async create(dto: CreatePricingDto) {
    const exisitng = await this.pricingModel.findOne({
      shuttleType: dto.shuttleType,
    });

    if (exisitng) {
      throw new BadRequestException(
        'Pricing already exists for this shuttleType',
      );
    }

    return this.pricingModel.create(dto);
  }

  async getByShuttleType(shuttleType: string) {
    const pricing = await this.pricingModel.findOne({
      shuttleType,
    });

    if (!pricing) {
      throw new NotFoundException('Pricing not found');
    }

    return pricing;
  }

  // Get All Pricing
  async getAll() {
    return this.pricingModel.find().sort({ createdAt: -1 });
  }

  async update(shuttleType: string, update: Partial<CreatePricingDto>) {
    const updated = await this.pricingModel.findOneAndUpdate(
      { shuttleType },
      update,
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Pricing not found');
    }

    return updated;
  }
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

  // async getEstimate(input: PricingInput){
  //   const shuttle = await this.pricingModel
  // }
}
