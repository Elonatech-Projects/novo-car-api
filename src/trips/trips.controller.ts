import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtUser } from '../admin/jwt.admin.types';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // PUBLIC: Search
  @Get('search')
  searchTrips(@Query() dto: SearchTripsDto) {
    return this.tripsService.searchTrips(dto);
  }

  // PUBLIC: Get by ID
  @Get(':id')
  getTrip(@Param('id') id: string) {
    return this.tripsService.getTripById(id);
  }

  // ADMIN: Create
  @UseGuards(JwtAdminGuard)
  @Post('create')
  createTrip(
    @Req() req: Request & { user: JwtUser },
    @Body(new ValidationPipe()) dto: CreateTripDto,
  ) {
    return this.tripsService.createTrip(req.user._id, dto);
  }

  @UseGuards(JwtAdminGuard)
  @Get()
  getAllTrips() {
    return this.tripsService.getAllTrips();
  }

  @UseGuards(JwtAdminGuard)
  @Get('admin/my-trips')
  getMyTrips(@Req() req: Request & { user: JwtUser }) {
    return this.tripsService.getTripsByAdmin(req.user._id);
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  updateTrip(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateTripDto,
  ) {
    return this.tripsService.updateTrip(id, dto);
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  deactivateTrip(@Param('id') id: string) {
    return this.tripsService.deactivateTrip(id);
  }
}
