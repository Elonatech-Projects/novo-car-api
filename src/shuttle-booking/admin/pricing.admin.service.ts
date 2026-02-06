// pricing.admin.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pricing, PricingDocument } from '../../pricing/pricing.schema';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Injectable()
export class PricingAdminService {
  constructor(
    @InjectModel(Pricing.name)
    private readonly pricingModel: Model<PricingDocument>,
  ) {}

  /**
   * Create pricing rule
   * One active rule per shuttleType
   */
  async create(dto: CreatePricingDto) {
    const existing = await this.pricingModel.findOne({
      shuttleType: dto.shuttleType,
      isActive: true,
    });

    if (existing) {
      throw new BadRequestException(
        'Active pricing already exists for this shuttle type',
      );
    }

    const pricing = await this.pricingModel.create({
      ...dto,
      isActive: true,
    });

    return {
      success: true,
      data: pricing,
    };
  }

  /**
   * List all pricing rules (admin)
   */
  async listAll() {
    const pricing = await this.pricingModel.find().sort({ createdAt: -1 });

    return {
      success: true,
      count: pricing.length,
      data: pricing,
    };
  }

  /**
   * Update pricing rule
   */
  async update(id: string, dto: UpdatePricingDto) {
    const pricing = await this.pricingModel.findById(id);

    if (!pricing) {
      throw new BadRequestException('Pricing rule not found');
    }

    Object.assign(pricing, dto);
    await pricing.save();

    return {
      success: true,
      data: pricing,
    };
  }

  /**
   * Activate / Deactivate pricing
   * (Soft control, never delete)
   */
  async toggle(id: string, isActive: boolean) {
    const pricing = await this.pricingModel.findById(id);

    if (!pricing) {
      throw new BadRequestException('Pricing rule not found');
    }

    pricing.isActive = isActive;
    await pricing.save();

    return {
      success: true,
      data: pricing,
    };
  }
}
