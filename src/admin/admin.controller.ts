// Admin Controller
// src\admin\admin.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin-dto';

@UseGuards(ThrottlerGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * POST /admin/create
   * ✅ Stricter throttle for admin creation — 3 attempts per minute max.
   * This endpoint should ideally also be protected by a setup key in production.
   */
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('create')
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  /**
   * POST /admin/sign-in
   * ✅ Returns 200 explicitly (NestJS defaults POST to 201 which is wrong for auth).
   * ✅ Throttled to 5 attempts per minute to limit brute-force attempts.
   */
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signAdminIn(@Body() dto: CreateAdminDto) {
    return this.adminService.loginAdmin(dto.email, dto.password);
  }
}
