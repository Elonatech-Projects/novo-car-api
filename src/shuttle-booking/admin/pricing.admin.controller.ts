// pricing.admin.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { PricingAdminService } from './pricing.admin.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Controller('admin/shuttle-bookings/pricing')
export class PricingAdminController {
  constructor(private readonly service: PricingAdminService) {}

  @Post()
  create(@Body() dto: CreatePricingDto) {
    return this.service.create(dto);
  }

  @Get()
  listAll() {
    return this.service.listAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePricingDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Query('active') active: string) {
    return this.service.toggle(id, active === 'true');
  }
}
