import { Body, Controller, Get, Post } from '@nestjs/common';
import { MoServicesService } from './mo-services.service';
import { CreateMoServicesDto } from './dto/mo-services.dto';

@Controller('mo-services')
export class MoServicesController {
  constructor(private readonly ManOutsourcingService: MoServicesService) {}

  @Post('create')
  async createManOutsourcing(@Body() dto: CreateMoServicesDto) {
    return this.ManOutsourcingService.createManOutsourcing(dto);
  }
  @Get()
  getAllRequests() {
    return this.ManOutsourcingService.getAllManPowerRequests();
  }
}
