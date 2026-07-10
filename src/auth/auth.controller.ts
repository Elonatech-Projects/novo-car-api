import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth-dto';
import { AuthResponse, ProfileResponse, Response } from './auth.service';
import { ResetPasswordDto } from './dto/resetpassword.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotpassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async createUser(@Body() dto: CreateAuthDto): Promise<AuthResponse> {
    return this.authService.createUser(dto);
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } }) // Limit to 5 requests per minute for this endpoint
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signUsersIn(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.loginUser(dto);
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<Response> {
    return this.authService.resetPassword(dto);
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<Response> {
    return this.authService.forgotPassword(dto);
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard) // Ensure this route is protected and requires authentication
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Request() req: { user?: { _id: string } },
  ): Promise<Response> {
    if (!req.user?._id) {
      throw new BadRequestException('Unauthorized');
    }
    return this.authService.changePassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: { user?: { _id: string } },
  ): Promise<ProfileResponse> {
    if (!req.user?._id) {
      throw new BadRequestException('Unauthorized');
    }
    return this.authService.getProfile(req.user._id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Request() req: { user?: { _id: string } },
  ): Promise<ProfileResponse> {
    if (!req.user?._id) {
      throw new BadRequestException('Unauthorized');
    }
    return this.authService.updateProfile(req.user._id, dto);
  }
}
