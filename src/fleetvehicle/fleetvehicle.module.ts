import { Module } from '@nestjs/common';
import { FleetvehicleService } from './fleetvehicle.service';
import { FleetvehicleController } from './fleetvehicle.controller';

@Module({
  controllers: [FleetvehicleController],
  providers: [FleetvehicleService],
})
export class FleetvehicleModule {}
