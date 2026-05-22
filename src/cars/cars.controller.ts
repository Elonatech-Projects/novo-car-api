// cars.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CarService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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
    FileInterceptor('image', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, and WebP images are accepted.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadCarImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.cloudinaryService.uploadFile(file, {
      folder: 'novo-cars/fleet',
      resourceType: 'image',
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
}
