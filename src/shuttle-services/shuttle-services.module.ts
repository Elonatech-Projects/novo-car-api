import { Module } from '@nestjs/common';
import { ShuttleServicesController } from './shuttle-services.controller';
import { ShuttleServicesService } from './shuttle-services.service';
import {
  ShuttleServicesSchema,
  Shuttle,
} from './schema/shuttle-service.schema';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ShuttleServiceCleanupService } from './shuttle-service-cleanup.service';
import { Schedule, ScheduleSchema } from '../schedule/schema/schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shuttle.name, schema: ShuttleServicesSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
  ],
  controllers: [ShuttleServicesController],
  providers: [ShuttleServicesService, ShuttleServiceCleanupService],
})
export class ShuttleServicesModule {}
