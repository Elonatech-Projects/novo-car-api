import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AirportTransferService } from './airport-transfer.service';
import { CreateAirportTransferDto } from './dto/create-airport-transfer.dto';
import { UpdateAirportTransferStatusDto } from './dto/update-airport-transfer-status.dto';
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

  // Admin — update review status. Transitioning to 'approved' sends the
  // customer a confirmation email.
  @UseGuards(JwtAdminGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAirportTransferStatusDto,
  ) {
    return this.airportTransferService.updateStatus(id, dto.status);
  }
}
