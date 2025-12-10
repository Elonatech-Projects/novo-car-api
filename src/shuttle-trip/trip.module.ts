import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { Trip, TripSchema } from './schema/trip.schema';
import { Admin, AdminSchema } from '../admin/schema/admin-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]), // <-- ADD THIS
  ],
  providers: [TripService],
  controllers: [TripController],
})
export class TripModule {}
