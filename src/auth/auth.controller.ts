import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async createUser(@Body() dto: CreateAuthDto) {
    return this.authService.createUser(dto);
  }

  @Post('sign-in')
  async signUsersIn(@Body() body: { email: string; password: string }) {
    console.log('SIGN IN HIT:', body);
    const { email, password } = body;
    return this.authService.LoginUser(email, password);
  }
}
