import { PartialType } from '@nestjs/mapped-types';
import { CreateFleetvehicleDto } from './create-fleetvehicle.dto';

export class UpdateFleetvehicleDto extends PartialType(CreateFleetvehicleDto) {}
