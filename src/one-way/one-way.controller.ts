import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OneWayService } from './one-way.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUser } from '../auth/jwt.types';
import { CreateOneWayDto } from './dto/create-one-way.dto';

@Controller('one-way')
export class OneWayController {
  constructor(private readonly oneWayService: OneWayService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createOneWay(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CreateOneWayDto,
  ) {
    const userId = req.user._id;
    return this.oneWayService.createOneWay(dto, userId);
  }
}
