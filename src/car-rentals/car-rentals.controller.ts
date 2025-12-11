import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CarRentalsService } from './car-rentals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUser } from '../auth/jwt.types';
import { CarRentalsDto } from './dto/car-rentals.dto';

@Controller('car-rentals')
export class CarRentalsController {
  constructor(private readonly carRentalService: CarRentalsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createCarRentals(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CarRentalsDto,
  ) {
    const userId = req.user._id;
    return this.carRentalService.createCarRentals(dto, userId);
  }
}
