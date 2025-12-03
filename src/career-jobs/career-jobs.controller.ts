import { Controller, Req } from '@nestjs/common';
import { Body, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { CreateCareerJobDto } from './dto/create-career-job.dto';
// import { createCareerJobsDto } from './dto/create-career-job.dto';
import { CareerJobsService } from './career-jobs.service';
import { CreateCareerJobsDto } from './dto/create-career-jobs.dto';

@Controller('career-jobs')
export class CareerJobsController {
  constructor(private readonly careerJobsService: CareerJobsService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Post('create/career-jobs')
  async createCareerJobs(
    @Req() req: any,

    @Body() dto: CreateCareerJobsDto,
  ) {
    // const userId = req.user._id;
    return this.careerJobsService.createCareerJob(dto);
  }
}
