import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CareerJobs } from './schema/career-jobs-schema';
import { Model } from 'mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { CreateCareerJobsDto } from './dto/create-career-jobs.dto';

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

    if (
      !header ||
      !location ||
      !type ||
      !category ||
      !shortDescription ||
      !postedDate ||
      !skills
    ) {
      throw new Error('All fields are to be filled');
    }

    // 🔥 Normalize skills to always be an array
    const skillsArray =
      typeof skills === 'string'
        ? skills
            .replace(/[\[\]]/g, '')
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
}
