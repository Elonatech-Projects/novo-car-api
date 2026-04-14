import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  async getCities() {
    return this.cityService.findAll(false);
  }

  @Get('admin')
  @UseGuards(JwtAdminGuard)
  async getAllCities() {
    return this.cityService.findAll(true); // admin sees all
  }
  // Admin-only endpoint to create a new city. The code is auto-generated and immutable.
  @Post()
  @UseGuards(JwtAdminGuard)
  async createCity(@Body() dto: CreateCityDto) {
    return this.cityService.createCity(dto);
  }

  // Admin able to update city name (code is immutable) and toggle active status.
  @Patch(':id')
  @UseGuards(JwtAdminGuard)
  async updateCity(@Body() dto: CreateCityDto, @Param('id') id: string) {
    return this.cityService.updateCity(id, dto);
  }

  // Admin-only endpoint to toggle city active status (soft delete).
  @Patch(':id/toggle')
  @UseGuards(JwtAdminGuard)
  async toggleCityStatus(@Param('id') id: string) {
    return this.cityService.toggleCityStatus(id);
  }
}
