// src/pricing/pricing-controller
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import type { PricingInput } from './pricing.types'; // 👈 type-only import
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { CreatePricingDto } from './dto/create-pricing.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // Create Pricing Rule
  @UseGuards(JwtAdminGuard)
  @Post()
  create(@Body() body: CreatePricingDto) {
    return this.pricingService.create(body);
  }

  @Post('estimate')
  estimate(@Body() body: PricingInput) {
    return this.pricingService.estimate(body);
  }

  @Get()
  getAll() {
    return this.pricingService.getAll();
  }

  @Get(':shuttleType')
  getOne(@Param('shuttleType') shuttleType: string) {
    return this.pricingService.getByShuttleType(shuttleType);
  }

  // Update Price
  @UseGuards(JwtAdminGuard)
  @Patch(':shuttleType')
  update(
    @Param('shuttleType') shuttleType: string,
    @Body() body: Partial<CreatePricingDto>,
  ) {
    return this.pricingService.update(shuttleType, body);
  }
}
