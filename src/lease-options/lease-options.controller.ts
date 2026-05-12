// src/lease-options/lease-options.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { LeaseOptionsService } from './lease-options.service';
import { CreateLeaseConsultationDto } from './dto/create-lease-option.dto';

@Controller('lease-options')
export class LeaseOptionsController {
  constructor(private readonly leaseService: LeaseOptionsService) {}

  @Post('consultation')
  async submitConsultation(
    @Body() dto: CreateLeaseConsultationDto,
  ): Promise<{ message: string }> {
    await this.leaseService.handleConsultation(dto);

    return { message: 'Consultation request submitted successfully' };
  }
}
