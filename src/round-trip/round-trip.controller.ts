import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RoundTripService } from './round-trip.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoundTripDto } from './dto/create-round-trip.dto';
import { Request } from 'express';
import { JwtUser } from '../auth/jwt.types';

@Controller('round-trip')
export class RoundTripController {
  constructor(private readonly roundTripService: RoundTripService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createRoundTrip(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CreateRoundTripDto,
  ) {
    const userId = req.user._id;
    return this.roundTripService.createRoundTrip(dto, userId);
  }
}
