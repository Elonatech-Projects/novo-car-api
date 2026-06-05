// Shuttle Service Controller
// src/shuttle-services/shuttle-services.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { ShuttleServicesService } from './shuttle-services.service';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';
import { FindAllShuttleServicesDto } from './dto/find-all-shuttle-services.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { JwtUser } from '../auth/jwt.types';

@Controller('shuttle-services')
export class ShuttleServicesController {
  constructor(
    private readonly shuttleServicesService: ShuttleServicesService,
  ) {}

  // ── USER: create a shuttle booking ─────────────────────────────────────────
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

  // ── ADMIN: fetch all bookings with optional filters ─────────────────────────
  // Query params (all optional):
  //   isRoundTrip  → true | false
  //   status       → reserved | paid | expired | refund_pending | refunded | cancelled
  //   seatCount    → number
  //   travelDate   → YYYY-MM-DD
  //   page         → number (default: 1)
  //   limit        → number (default: 20)
  @Get()
  @UseGuards(JwtAdminGuard)
  async findAll(@Query() filters: FindAllShuttleServicesDto) {
    return this.shuttleServicesService.findAll(filters);
  }

  @Get('all')
  @UseGuards(JwtAdminGuard)
  async getAllBookings() {
    return this.shuttleServicesService.getAllBookings();
  }

  // ── ADMIN: delete a booking ─────────────────────────────────────────────────
  // Built-in guards block deletion of RESERVED, PAID, and REFUND_PENDING bookings.
  // Only EXPIRED, REFUNDED, and CANCELLED bookings can be deleted.
  // This prevents accidental data loss during active payment windows or
  // confirmed transactions that may need reconciliation.
  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async deleteBooking(@Param('id') id: string) {
    return this.shuttleServicesService.deleteBooking(id);
  }
}
