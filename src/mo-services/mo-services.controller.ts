import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MoServicesService } from './mo-services.service';
import { CreateMoServicesDto } from './dto/mo-services.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('mo-services')
export class MoServicesController {
  constructor(private readonly ManOutsourcingService: MoServicesService) {}

  @Post('create')
  async createManOutsourcing(@Body() dto: CreateMoServicesDto) {
    return this.ManOutsourcingService.createManOutsourcing(dto);
  }

  // Was unguarded — every comparable "list all" endpoint elsewhere
  // (job-application, career-jobs, newsroom, booking-request,
  // airport-transfer, schedule-consultation) guards this exact shape of
  // route; this one was missed.
  @UseGuards(JwtAdminGuard)
  @Get()
  getAllRequests() {
    return this.ManOutsourcingService.getAllManPowerRequests();
  }
}
