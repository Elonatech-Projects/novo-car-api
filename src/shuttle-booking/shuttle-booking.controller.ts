// Shuttle booking controller
import {
  Controller,
  Post,
  Body,
  Req,
  Query,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ShuttleBookingService } from './shuttle-booking.service';
import { CreateShuttleBookingDto } from './dto/create-shuttle-booking.dto';
import { ShuttleType } from './enums';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import type { AuthRequest } from '../common/types/auth-request.type';

@Controller('booking-form')
export class ShuttleBookingController {
  constructor(private readonly service: ShuttleBookingService) {}

  @Post()
  async create(@Body() dto: CreateShuttleBookingDto, @Req() req: AuthRequest) {
    return this.service.create(dto, req.user?.id);
  }

  /**
   * GET /shuttle-bookings
   * Admin-style listing (filters supported)
   */
  @Get()
  async listAll(
    @Query('status') status?: BookingStatus,
    @Query('shuttleType') shuttleType?: ShuttleType,
  ) {
    return this.service.listAll({ status, shuttleType });
  }
  /**
   * GET /shuttle-bookings/my
   * List bookings for logged-in user
   */
  @Get('my')
  async listMine(@Req() req: AuthRequest) {
    return this.service.listByUser(req.user?.id);
  }

  /**
   * GET /shuttle-bookings/:id
   * Fetch single booking (confirmation page, admin, support)
   */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }
}
