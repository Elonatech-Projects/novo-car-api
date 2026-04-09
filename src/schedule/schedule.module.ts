import { Module } from '@nestjs/common';
import { Schedule, ScheduleSchema } from './schema/schedule.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { CityService } from '../city/city.service';
import { City, CitySchema } from '../city/schema/city.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: City.name, schema: CitySchema },
    ]),
  ],
  providers: [ScheduleService, CityService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
