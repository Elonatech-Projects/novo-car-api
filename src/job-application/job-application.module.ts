import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import {
  JobApplication,
  JobApplicationSchema,
} from './schema/job-application.schema';

import { JobApplicationsService } from './job-application.service';
import { JobApplicationsController } from './job-application.controller';

import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MailModule,
    NotificationsModule,

    MulterModule.register({
      storage: memoryStorage(),
    }),

    MongooseModule.forFeature([
      {
        name: JobApplication.name,
        schema: JobApplicationSchema,
      },
    ]),
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
})
export class JobApplicationsModule {}
