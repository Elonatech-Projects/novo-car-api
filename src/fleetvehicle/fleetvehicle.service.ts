import { Injectable } from '@nestjs/common';
import { CreateFleetvehicleDto } from './dto/create-fleetvehicle.dto';
import { UpdateFleetvehicleDto } from './dto/update-fleetvehicle.dto';

@Injectable()
export class FleetvehicleService {
  create(createFleetvehicleDto: CreateFleetvehicleDto) {
    return 'This action adds a new fleetvehicle';
  }

  findAll() {
    return `This action returns all fleetvehicle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fleetvehicle`;
  }

  update(id: number, updateFleetvehicleDto: UpdateFleetvehicleDto) {
    return `This action updates a #${id} fleetvehicle`;
  }

  remove(id: number) {
    return `This action removes a #${id} fleetvehicle`;
  }
}
