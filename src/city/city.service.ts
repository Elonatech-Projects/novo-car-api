// City Service
// src\city\city.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City, CityDocument } from './schema/city.schema';
import { CreateCityDto } from './dto/create-city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectModel(City.name)
    private readonly cityModel: Model<CityDocument>,
  ) {}

  private async generateUniqueCode(name: string): Promise<string> {
    const base = name
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toLowerCase();

    let code = base;
    let counter = 1;

    while (await this.cityModel.exists({ code })) {
      code = `${base}${counter}`;
      counter++;
    }

    return code;
  }

  async createCity(dto: CreateCityDto): Promise<City> {
    const name = dto.name.trim().toLowerCase();

    const existing = await this.cityModel.findOne({ name }).lean();

    if (existing) {
      throw new BadRequestException('City already exists');
    }

    const code = await this.generateUniqueCode(name);

    return this.cityModel.create({ name, code });
  }

  async findAll(includeInactive = false): Promise<City[]> {
    const filter = includeInactive ? {} : { isActive: true };

    return this.cityModel.find(filter).sort({ name: 1 }).lean().exec();
  }

  async updateCity(id: string, dto: CreateCityDto): Promise<City> {
    const name = dto.name.trim().toLowerCase();

    const existingCity = await this.cityModel.findById(id);

    if (!existingCity) {
      throw new BadRequestException('City not found');
    }

    let code = existingCity.code;

    if (existingCity.name !== name) {
      const duplicate = await this.cityModel.findOne({
        _id: { $ne: id },
        name,
      });

      if (duplicate) {
        throw new BadRequestException('City name already exists');
      }

      code = await this.generateUniqueCode(name);
    }

    existingCity.name = name;
    existingCity.code = code;

    await existingCity.save();

    return existingCity;
  }

  async toggleCityStatus(id: string): Promise<City> {
    const city = await this.cityModel.findById(id);

    if (!city) {
      throw new BadRequestException('City not found');
    }

    city.isActive = !city.isActive;
    await city.save();

    return city;
  }
}
