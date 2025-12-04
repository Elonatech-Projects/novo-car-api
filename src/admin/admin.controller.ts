import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin-dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Post('sign-in')
  async signAdminIn(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.adminService.loginAdmin(email, password);
  }
}
