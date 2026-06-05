// booking-request.controller.ts

import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { BookingRequestService } from './booking-request.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateBookingRequestDto } from './dto/update-booking-request.dto';

@Controller('booking-request')
export class BookingRequestController {
  constructor(private readonly service: BookingRequestService) {}

  @Post()
  async create(@Body() dto: CreateBookingRequestDto) {
    await this.service.create(dto);

    return {
      message: 'Booking request submitted successfully',
    };
  }

  @UseGuards(JwtAdminGuard)
  @Get('all')
  async getAll() {
    return this.service.getAll();
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingRequestDto,
  ) {
    const updated = await this.service.updateStatus(id, dto);
    return updated;
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return {
      message: 'Booking request deleted successfully',
    };
  }
}
