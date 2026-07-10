import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ScheduleConsultationService } from './schedule-consultation.service';
import { CreateScheduleConsultationDto } from './dto/create-schedule-consultation.dto';
import { UpdateScheduleConsultationDto } from './dto/update-schedule-consultation.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('schedule-consultation')
export class ScheduleConsultationController {
  constructor(
    private readonly scheduleConsultationService: ScheduleConsultationService,
  ) {}

  @Post()
  create(@Body() createScheduleConsultationDto: CreateScheduleConsultationDto) {
    return this.scheduleConsultationService.create(
      createScheduleConsultationDto,
    );
  }

  @Get()
  @UseGuards(JwtAdminGuard)
  findAll() {
    return this.scheduleConsultationService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAdminGuard)
  findOne(@Param('id') id: string) {
    return this.scheduleConsultationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateScheduleConsultationDto: UpdateScheduleConsultationDto,
  ) {
    return this.scheduleConsultationService.update(
      id,
      updateScheduleConsultationDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  remove(@Param('id') id: string) {
    return this.scheduleConsultationService.remove(id);
  }
}
