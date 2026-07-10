import { Module } from '@nestjs/common';
import { Schedule, ScheduleSchema } from './schema/schedule.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { CityService } from '../city/city.service';
import { City, CitySchema } from '../city/schema/city.schema';
import {
  Shuttle,
  ShuttleServicesSchema,
} from '../shuttle-services/schema/shuttle-service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: City.name, schema: CitySchema },
      // Read-only here — needed to compute live seat availability in search
      // results. Booking creation/locking still lives in ShuttleServicesModule.
      { name: Shuttle.name, schema: ShuttleServicesSchema },
    ]),
  ],
  providers: [ScheduleService, CityService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
