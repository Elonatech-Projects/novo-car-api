import { Body, Controller, Post } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FleetManagementService } from './fleet-management.service';
import { CreateFleetManagementDto } from './dto/create-fleet-management.dto';
import { Request } from 'express';
// import { JwtUser } from '../auth/jwt.types';

@Controller('fleet-management')
export class FleetManagementController {
  constructor(
    private readonly fleetManagementService: FleetManagementService,
  ) {}

  @Post('create')
  // @UseGuards(JwtAuthGuard)
  async createFleetManagement(
    // @Req()
    @Body() dto: CreateFleetManagementDto,
  ) {
    // const userId = req.user._id;
    return this.fleetManagementService.createFleetManagement(dto);
  }
}
