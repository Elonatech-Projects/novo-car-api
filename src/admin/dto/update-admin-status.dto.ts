// Enable/disable an admin
// src\admin\dto\update-admin-status.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdateAdminStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
