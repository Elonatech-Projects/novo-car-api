// cars.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Car, CarDocument } from './schema/car.schema';
import { Model } from 'mongoose';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarService {
  constructor(
    @InjectModel(Car.name)
    private readonly carModel: Model<CarDocument>,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const car = new this.carModel(createCarDto);
    return car.save();
  }

  async findAll(): Promise<Car[]> {
    return this.carModel
      .find({ isAvailable: true })
      .lean()
      .sort({ createdAt: 1 });
  }

  async findAllAdmin(): Promise<Car[]> {
    return this.carModel.find().lean().sort({ createdAt: 1 });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carModel.findById(id).lean();

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    const updated = await this.carModel
      .findByIdAndUpdate(id, updateCarDto, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Car not found');
    }

    return updated;
  }

  async toggleAvailability(id: string): Promise<Car> {
    const car = await this.carModel.findById(id);

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    car.isAvailable = !car.isAvailable;
    await car.save();
    return car;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.carModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('Car not found');
    }

    return { message: 'Car deleted successfully' };
  }
}
