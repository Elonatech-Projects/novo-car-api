import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareerJobs, CareerJobsSchema } from './schema/career-jobs-schema';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { CareerJobsController } from './career-jobs.controller';
import { CareerJobsService } from './career-jobs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CareerJobs.name,
        schema: CareerJobsSchema,
      },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  controllers: [CareerJobsController],
  providers: [CareerJobsService],
})
export class CareerJobsModule {}
