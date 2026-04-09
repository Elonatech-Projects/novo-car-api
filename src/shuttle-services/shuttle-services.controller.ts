// Shuttle Service Controller
// src/shuttle-services/shuttle-services.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { ShuttleServicesService } from './shuttle-services.service';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

    const booking = await this.shuttleServicesService.createShuttle(
      dto,
      userId,
    );

    return {
      success: true,
      message: 'Shuttle booking created successfully',
      data: {
        bookingId: booking.bookingId,
        totalAmount: booking.totalAmount,
        expiresAt: booking.expiresAt.toISOString(),
      },
    };
  }
}
