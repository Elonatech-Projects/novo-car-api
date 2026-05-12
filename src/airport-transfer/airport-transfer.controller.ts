import { Controller, Post, Body } from '@nestjs/common';
import { AirportTransferService } from './airport-transfer.service';
import { CreateAirportTransferDto } from './dto/create-airport-transfer.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('airport-transfer')
export class AirportTransferController {
  constructor(
    private readonly airportTransferService: AirportTransferService,
  ) {}

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post()
  create(@Body() dto: CreateAirportTransferDto) {
    return this.airportTransferService.create(dto);
  }
}
