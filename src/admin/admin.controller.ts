// Admin Controller
// src\admin\admin.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin-dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { JwtAdminGuard } from './guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import type { JwtUser } from './jwt.admin.types';

@UseGuards(ThrottlerGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * POST /admin/bootstrap
   * One-time seed of the FIRST super admin. Requires ADMIN_SETUP_KEY and only
   * works while there are zero admins. Self-disables afterwards.
   */
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('bootstrap')
  async bootstrap(@Body() dto: BootstrapAdminDto) {
    return this.adminService.bootstrap(dto);
  }

  /**
   * POST /admin/create
   * Create a new admin. Restricted to authenticated SUPER ADMINS.
   */
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @UseGuards(JwtAdminGuard, SuperAdminGuard)
  @Post('create')
  async createAdmin(@Body() dto: CreateAdminDto, @Req() req: { user: JwtUser }) {
    return this.adminService.createAdmin(dto, {
      id: req.user._id,
      email: req.user.email,
    });
  }

  /**
   * GET /admin
   * List all admins. Super admin only.
   */
  @UseGuards(JwtAdminGuard, SuperAdminGuard)
  @Get()
  async listAdmins() {
    return this.adminService.listAdmins();
  }

  /**
   * PATCH /admin/:id/status
   * Enable or disable an admin. Super admin only.
   */
  @UseGuards(JwtAdminGuard, SuperAdminGuard)
  @Patch(':id/status')
  async setStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminStatusDto,
    @Req() req: { user: JwtUser },
  ) {
    return this.adminService.setAdminStatus(id, dto.isActive, req.user._id);
  }

  /**
   * POST /admin/sign-in
   * ✅ Returns 200 explicitly. Throttled to 5 attempts/min to limit brute force.
   */
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signAdminIn(@Body() dto: LoginAdminDto) {
    return this.adminService.loginAdmin(dto.email, dto.password);
  }
}
