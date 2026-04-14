// Career Jobs Controller
// src\career-jobs\career-jobs.controller.ts
import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { CareerJobsService } from './career-jobs.service';
import { CreateCareerJobsDto } from './dto/create-career-jobs.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { UpdateCareerJobsDto } from './dto/update-career-job.dto';

@Controller('career-jobs')
export class CareerJobsController {
  constructor(private readonly careerJobsService: CareerJobsService) {}

  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(JwtAdminGuard) // Placeholder for actual auth guard
  @Post('create/career-jobs')
  async createCareerJobs(
    @Req() req: any,

    @Body() dto: CreateCareerJobsDto,
  ) {
    // const userId = req.user._id;
    return this.careerJobsService.createCareerJob(dto);
  }

  @Get('fetch')
  async getAllCareerJobs() {
    return this.careerJobsService.getCareerJob();
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async deleteCareerJob(@Req() req: any, @Param('id') id: string) {
    return this.careerJobsService.deleteCareerJob(id);
  }

  @Patch(':id/update')
  @UseGuards(JwtAdminGuard)
  async updateCareerJob(
    @Param('id') id: string,
    @Body() dto: UpdateCareerJobsDto,
  ) {
    return this.careerJobsService.updateCareerJob(id, dto);
  }

  // Toggle career job active status (soft delete)
  @Patch(':id')
  @UseGuards(JwtAdminGuard)
  async toggleCareerJob(@Req() req: any, @Param('id') id: string) {
    return this.careerJobsService.toggleCareerJob(id);
  }
}
