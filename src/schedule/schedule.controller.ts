import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { Schedule } from './schema/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('search')
  async search(@Query() query: SearchScheduleDto): Promise<Schedule[]> {
    return this.scheduleService.searchSchedules(query);
  }

  @Post()
  async create(@Body() payload: CreateScheduleDto) {
    return this.scheduleService.createSchedule(payload);
  }
}
