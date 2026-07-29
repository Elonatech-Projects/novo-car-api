import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FleetvehicleService } from './fleetvehicle.service';
import { CreateFleetvehicleDto } from './dto/create-fleetvehicle.dto';
import { UpdateFleetvehicleDto } from './dto/update-fleetvehicle.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

// NOTE: this whole controller is unused Nest-CLI scaffold — the service
// just returns hardcoded placeholder strings, no real DB model exists. It
// was still reachable unauthenticated though, so guarding for consistency;
// consider deleting this module entirely if it's genuinely never going to
// be built out (see FleetManagement module for the real fleet feature).
@UseGuards(JwtAdminGuard)
@Controller('fleetvehicle')
export class FleetvehicleController {
  constructor(private readonly fleetvehicleService: FleetvehicleService) {}

  @Post()
  create(@Body() createFleetvehicleDto: CreateFleetvehicleDto) {
    return this.fleetvehicleService.create(createFleetvehicleDto);
  }

  @Get()
  findAll() {
    return this.fleetvehicleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fleetvehicleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFleetvehicleDto: UpdateFleetvehicleDto) {
    return this.fleetvehicleService.update(+id, updateFleetvehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fleetvehicleService.remove(+id);
  }
}
