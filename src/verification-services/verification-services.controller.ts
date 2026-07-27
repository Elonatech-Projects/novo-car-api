// verification-services.controller.ts
// Controller for handling verification service requests
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { VerificationServicesService } from './verification-services.service';
import { CreateVerificationServicesDto } from './dto/verification-services.dto';

@UseGuards(ThrottlerGuard)
@Controller('verification-services')
export class VerificationServicesController {
  constructor(
    private verificationServicesService: VerificationServicesService,
  ) {}

  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('create')
  async createVerificationRequest(@Body() dto: CreateVerificationServicesDto) {
    return this.verificationServicesService.createVerificationRequest(dto);
  }
}
