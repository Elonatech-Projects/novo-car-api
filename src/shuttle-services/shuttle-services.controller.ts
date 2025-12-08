import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ShuttleServicesService } from './shuttle-services.service';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtUser } from '../auth/jwt.types';

@Controller('shuttle-services')
export class ShuttleServicesController {
  constructor(
    private readonly shuttleServicesService: ShuttleServicesService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createShuttleService(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CreateShuttleServicesDto,
  ) {
    const userId = req.user._id;
    return this.shuttleServicesService.createShuttle(dto, userId);
  }
}
