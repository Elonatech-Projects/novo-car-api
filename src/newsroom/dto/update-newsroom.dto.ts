// src/newsroom/dto/update-newsroom.dto.ts
// Partial update DTO — all fields optional so admin can edit just one field at a time

import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsroomDto } from './create-newsroom.dto';

export class UpdateNewsroomDto extends PartialType(CreateNewsroomDto) {}
