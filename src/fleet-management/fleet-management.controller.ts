import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FleetManagementService } from './fleet-management.service';
import { CreateFleetManagementDto } from './dto/create-fleet-management.dto';
// import { FleetManagementService } from './fleet-management.service';

@Controller('fleet-management')
export class FleetManagementController {
  constructor(
    private readonly fleetManagementService: FleetManagementService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createFleetManagement(
    @Req() req: any,
    @Body() dto: CreateFleetManagementDto,
  ) {
    const userId = req.user._id;
    return this.fleetManagementService.createFleetManagement(dto, userId);
  }
}
