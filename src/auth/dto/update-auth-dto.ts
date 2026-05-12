// Update Auth DTO
// This DTO defines the structure and validation rules for the data required to update a user's authentication information. It extends the CreateAuthDto using PartialType, making all fields optional for updates while retaining the same validation rules.
// src/auth/dto/update-auth-dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth-dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
