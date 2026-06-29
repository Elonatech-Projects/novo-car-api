import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AirportTransferService } from './airport-transfer.service';
import { CreateAirportTransferDto } from './dto/create-airport-transfer.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('airport-transfer')
export class AirportTransferController {
  constructor(
    private readonly airportTransferService: AirportTransferService,
  ) {}

  // Public — submit an airport transfer booking request.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post()
  create(@Body() dto: CreateAirportTransferDto) {
    return this.airportTransferService.create(dto);
  }

  // Admin — list all airport transfer bookings.
  @UseGuards(JwtAdminGuard)
  @Get()
  getAll() {
    return this.airportTransferService.getAll();
  }
}
