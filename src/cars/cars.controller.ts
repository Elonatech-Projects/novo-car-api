// cars.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CarService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cars')
export class CarController {
  constructor(
    private readonly carService: CarService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // 🌍 PUBLIC — for frontend
  @Get()
  findAll() {
    return this.carService.findAll();
  }

  // 🔐 ADMIN — full access
  @UseGuards(JwtAdminGuard)
  @Get('admin')
  findAllAdmin() {
    return this.carService.findAllAdmin();
  }

  @UseGuards(JwtAdminGuard)
  @Post()
  create(@Body() dto: CreateCarDto) {
    return this.carService.create(dto);
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCarDto) {
    return this.carService.update(id, dto);
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id/toggle')
  toggleAvailability(@Param('id') id: string) {
    return this.carService.toggleAvailability(id);
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carService.remove(id);
  }

  @UseGuards(JwtAdminGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCarImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file, {
      folder: 'novo-cars',
      resourceType: 'image',
    });

    return {
      url: result.secure_url, // THIS is what frontend needs
    };
  }
}
