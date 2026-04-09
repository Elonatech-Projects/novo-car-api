import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  async getCities() {
    return this.cityService.findAll();
  }

  @Post()
  @UseGuards(JwtAdminGuard)
  async createCity(@Body() dto: CreateCityDto) {
    return this.cityService.createCity(dto);
  }
}
