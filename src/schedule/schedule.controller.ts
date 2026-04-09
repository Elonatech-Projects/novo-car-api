// src\schedule\schedule.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { Schedule } from './schema/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('search')
  async search(@Query() query: SearchScheduleDto): Promise<Schedule[]> {
    return this.scheduleService.searchSchedules(query);
  }

  // Admin-only endpoint to create a new schedule.
  @UseGuards(JwtAdminGuard)
  @Post()
  async create(@Body() payload: CreateScheduleDto) {
    return this.scheduleService.createSchedule(payload);
  }

  // Admin-only endpoint to list all schedules (for management purposes).
  @Get()
  @UseGuards(JwtAdminGuard)
  async findAll() {
    return this.scheduleService.findAll();
  }

  // Admin-only endpoint to update schedule details (except for the code, which is immutable).
  @Patch(':id')
  @UseGuards(JwtAdminGuard)
  async update(
    @Param('id') id: string,
    @Body() payload: Partial<CreateScheduleDto>,
  ) {
    return this.scheduleService.updateSchedule(id, payload);
  }

  // Admin-only endpoint to toggle schedule active status (soft delete).
  @Patch(':id/toggle')
  @UseGuards(JwtAdminGuard)
  async toggle(@Param('id') id: string) {
    return this.scheduleService.toggleSchedule(id);
  }

  // Admin-only endpoint to permanently delete a schedule (use with caution).
  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async remove(@Param('id') id: string) {
    return this.scheduleService.deleteSchedule(id);
  }
}
