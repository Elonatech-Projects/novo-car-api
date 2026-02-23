import { Module } from '@nestjs/common';
import { Schedule, ScheduleSchema } from './schema/schedule.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
  ],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
