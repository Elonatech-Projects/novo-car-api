import { PartialType } from '@nestjs/mapped-types';
import { CreateAirportTransferDto } from './create-airport-transfer.dto';

export class UpdateAirportTransferDto extends PartialType(CreateAirportTransferDto) {}
