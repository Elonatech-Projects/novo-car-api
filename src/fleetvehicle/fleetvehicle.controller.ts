import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FleetvehicleService } from './fleetvehicle.service';
import { CreateFleetvehicleDto } from './dto/create-fleetvehicle.dto';
import { UpdateFleetvehicleDto } from './dto/update-fleetvehicle.dto';

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
