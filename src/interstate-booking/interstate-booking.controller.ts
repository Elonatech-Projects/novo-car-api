// src/interstate-booking/interstate-booking.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { InterstateBookingService } from './interstate-booking.service';
import { CreateInterstateBookingDto } from './dto/create-interstate-booking.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('interstate-booking')
export class InterstateBookingController {
  constructor(private readonly service: InterstateBookingService) {}

  // Public — quote request form. Throttled against spam.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post()
  create(@Body() dto: CreateInterstateBookingDto) {
    return this.service.create(dto);
  }

  // Admin — list all interstate requests.
  @UseGuards(JwtAdminGuard)
  @Get()
  getAll() {
    return this.service.getAll();
  }
}
