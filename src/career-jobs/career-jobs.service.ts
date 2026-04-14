// Career Job Service
// src/career-jobs/career-jobs.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CareerJobs } from './schema/career-jobs-schema';
import { Model } from 'mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { CreateCareerJobsDto } from './dto/create-career-jobs.dto';
import { UpdateCareerJobsDto } from './dto/update-career-job.dto';

@Injectable()
export class CareerJobsService {
  constructor(
    @InjectModel(CareerJobs.name) private careerJobsModel: Model<CareerJobs>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
  ) {}

  async createCareerJob(dto: CreateCareerJobsDto) {
    const {
      header,
      location,
      type,
      category,
      shortDescription,
      postedDate,
      skills,
    } = dto;

    for (const [key, value] of Object.entries(dto)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    // Normalize skills to always be an array
    const skillsArray =
      typeof skills === 'string'
        ? skills
            .replace(/[[\]]/g, '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : skills;

    const data = {
      header,
      location,
      type,
      category,
      shortDescription,
      postedDate,
      skills: skillsArray,
    };

    const userCareerJob = await this.careerJobsModel.create(data);

    return {
      message: 'Career job created',
      success: true,
      userCareerJob,
    };
  }

  // Fetch all career jobs (admin only)
  async getCareerJob() {
    const job = await this.careerJobsModel.find();

    if (!job) {
      throw new BadRequestException('No document found in database');
    }

    return {
      message: 'Document Found',
      success: true,
      job,
    };
  }
  async getCareerJobById(id: string) {
    const job = await this.careerJobsModel.findById(id);

    if (!job) {
      throw new BadRequestException('No document found in database');
    }

    return {
      message: 'Document Found',
      success: true,
      job,
    };
  }

  // Delete a career job (admin only)
  async deleteCareerJob(id: string) {
    const deleted = await this.careerJobsModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new BadRequestException('No document found in database');
    }

    return {
      message: 'Document Deleted',
      success: true,
      deleted,
    };
  }

  // Toggle a career job's active status (admin only)
  async toggleCareerJob(id: string) {
    const job = await this.careerJobsModel.findById(id);

    if (!job) {
      throw new BadRequestException('No document found in database');
    }
    job.isActive = !job.isActive;
    await job.save();
    return {
      message: 'Career job status toggled',
      success: true,
      job,
    };
  }

  // Update a career job (admin only)
  async updateCareerJob(id: string, dto: UpdateCareerJobsDto) {
    const job = await this.careerJobsModel.findById(id);

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    // Normalize skills if present
    if (dto.skills) {
      dto.skills =
        typeof dto.skills === 'string'
          ? dto.skills
              .replace(/[[\]]/g, '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : dto.skills;
    }

    Object.assign(job, dto);

    await job.save();

    return {
      success: true,
      message: 'Career job updated',
      job,
    };
  }
}
