import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { SearchTripDto } from './dto/search-trip.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtUser } from '../admin/jwt.admin.types';

@Controller('shuttle-trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  // Admin: create trip
  @UseGuards(JwtAdminGuard)
  @Post('create')
  async createTrip(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CreateTripDto,
  ) {
    const adminId = req.user._id;
    console.log('only admin id can create', adminId);

    return this.tripService.createTrip(dto, adminId);
  }

  // User: search trips
  @Get('search')
  async searchTrips(@Query() search: SearchTripDto) {
    return this.tripService.searchTrips(search);
  }

  // Admin: get all trips
  @UseGuards(JwtAdminGuard)
  @Get('find-all-trip')
  async getAllTrips() {
    return this.tripService.getAllTrips();
  }
}
