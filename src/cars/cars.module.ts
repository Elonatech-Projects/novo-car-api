import { Module } from '@nestjs/common';
import { CarService } from './cars.service';
import { CarController } from './cars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from './schema/car.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])],
  controllers: [CarController],
  providers: [CarService, CloudinaryService],
})
export class CarModule {}
