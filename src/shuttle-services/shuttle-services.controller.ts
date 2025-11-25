
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShuttleServicesService } from './shuttle-services.service';
import { CreateShuttleServicesDto } from './dto/create-shuttle-services.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('shuttle-services')
export class ShuttleServicesController {
  constructor(
    private readonly shuttleServicesService: ShuttleServicesService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createShuttleService(
    @Req() req,
    @Body() dto: CreateShuttleServicesDto,
  ) {
    const userId = req.user._id;
    return this.shuttleServicesService.createShuttle(dto, userId);
  }
}
