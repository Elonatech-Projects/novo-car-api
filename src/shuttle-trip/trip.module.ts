import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { ShuttleTrip, TripSchema } from './schema/trip.schema';
import { Admin, AdminSchema } from '../admin/schema/admin-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShuttleTrip.name, schema: TripSchema }]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]), // <-- ADD THIS
  ],
  providers: [TripService],
  controllers: [TripController],
  exports: [TripService],
})
export class TripModule {}
