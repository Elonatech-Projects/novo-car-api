// verification-services.controller.ts
// Controller for handling verification service requests
import { Body, Controller, Post } from '@nestjs/common';
import { VerificationServicesService } from './verification-services.service';
import { CreateVerificationServicesDto } from './dto/verification-services.dto';

@Controller('verification-services')
export class VerificationServicesController {
  constructor(
    private verificationServicesService: VerificationServicesService,
  ) {}

  @Post('create')
  async createVerificationRequest(@Body() dto: CreateVerificationServicesDto) {
    return this.verificationServicesService.createVerificationRequest(dto);
  }
}
