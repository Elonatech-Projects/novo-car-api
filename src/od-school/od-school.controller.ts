// src\od-school\od-school.controller.ts
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OdSchoolService } from './od-school.service';
import { CreateODSchoolDto } from './dto/od-school.dto';
import { ODSchool } from './schema/od-school.schema';

@Controller('od-school')
export class OdSchoolController {
  constructor(private readonly odSchoolService: OdSchoolService) {}

  @Post('bookings')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 per minute per IP
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() dto: CreateODSchoolDto,
    @Ip() ip: string,
  ): Promise<ODSchool> {
    return this.odSchoolService.createODSchool(dto, ip);
  }
}
