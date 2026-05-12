// Auth Service
// src\auth\auth.service.ts
import * as crypto from 'crypto';
import {
  Injectable,
  BadRequestException,
  Logger,
  // UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { CreateAuthDto } from './dto/create-auth-dto';
import { Auth, AuthDocument } from './schema/auth-schema';
import { InjectModel } from '@nestjs/mongoose';
import { JwtPayload } from './jwt.types';
import * as bcrypt from 'bcrypt';
import { NotificationService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotpassword.dto';
import { ResetPasswordDto } from './dto/resetpassword.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export interface AuthResponse {
  message: string;
  success: boolean;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

export interface Response {
  message: string;
  success: boolean;
  data?: any;
}

const BCRYPT_ROUNDS = 12;
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createAuthDto: CreateAuthDto): Promise<AuthResponse> {
    const { name, email, password, confirmPassword, phoneNumber } =
      createAuthDto;

    // Basic validation
    // if (!name || !email || !password || !confirmPassword || !phoneNumber) {
    //   throw new BadRequestException('All fields are required');
    // }
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await this.authModel.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const userData = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
    };

    // Save user
    let user: AuthDocument;

    try {
      user = await this.authModel.create(userData);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        throw new BadRequestException('Email already registered');
      }

      throw error;
    }

    /* -------- User Notification ------------ */
    this.notificationService
      .sendEmail({
        to: user.email,
        subject: 'Welcome to Novo Cars 🎉',
        template: 'welcome-user',
        context: {
          name: user.name,
          email: user.email,
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      })
      .catch((err) => {
        this.logger.warn('Signup email failed', err);
      });

    /* ------ADMIN NOTIFICATION ----- */
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn(
        'ADMIN_EMAIL is not configured — skipping email address <Auth Service>',
      );
    } else {
      this.notificationService
        .sendEmail({
          to: adminEmail,
          subject: 'New User Created',
          template: 'welcome-user-admin',
          context: {
            name: user.name,
            email: user.email,
          },
        })
        .catch((err) => {
          this.logger.warn('Admin email failed', err);
        });
    }

    const jwtPayload: JwtPayload = {
      sub: String(user._id),
      email: user.email,
    };

    const token = this.jwtService.sign(jwtPayload, {
      expiresIn: '7d', // Token valid for 7 days
    });
    return {
      message: 'Account created successfully',
      success: true,
      token,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  async loginUser(dto: LoginDto): Promise<AuthResponse> {
    const { email, password } = dto;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    // Normalize email to prevent case sensitivity issues and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();
    const registeredUser = await this.authModel.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether email exists or not to prevent user enumeration
    if (!registeredUser) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      registeredUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: String(registeredUser._id),
      email: registeredUser.email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '7d', // Token valid for 7 days
    });

    this.notificationService
      .sendEmail({
        to: registeredUser.email,
        subject: 'New Login Detected',
        template: 'login-alert',
        context: {
          name: registeredUser.name,
          time: new Date().toISOString(),
        },
      })
      .catch((err) => {
        this.logger.warn('Login email failed', err);
      });

    // Log the login event and update last login time
    this.logger.log(`User logged in: ${registeredUser.email}`);
    registeredUser.lastLogin = new Date();
    await registeredUser.save();

    return {
      message: 'Login successful',
      success: true,
      token,
      user: {
        _id: String(registeredUser._id),
        name: registeredUser.name,
        email: registeredUser.email,
        phoneNumber: registeredUser.phoneNumber,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<Response> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.authModel.findOne({
      email: normalizedEmail,
    });
    if (!user) {
      // Don't reveal user existence
      throw new BadRequestException(
        'If that email is registered, a reset link has been sent',
      );
    }

    const rawToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await user.save();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/auth/forgot-password?token=${rawToken}`;

    this.notificationService
      .sendEmail({
        to: user.email,
        subject: 'Reset Your Password',
        template: 'forgot-password',
        context: {
          name: user.name,
          resetLink,
        },
      })
      .catch((err) => {
        this.logger.warn('Forgot password email failed', err);
      });

    return { success: true, message: 'Reset link sent' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<Response> {
    const { token, newPassword } = dto;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.authModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    // FIRST: check against OLD password
    const isSame = await bcrypt.compare(newPassword, user.password);

    if (isSame) {
      throw new BadRequestException('New password must be different');
    }

    // THEN hash and update
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.password = hashedPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    this.notificationService
      .sendEmail({
        to: user.email,
        subject: 'Your Password Was Reset Successfully',
        template: 'password-reset-success',
        context: {
          name: user.name,
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      })
      .catch((err) => {
        this.logger.warn('Reset success email failed', err);
      });

    return { success: true, message: 'Password reset successful' };
  }

  async changePassword(dto: ChangePasswordDto): Promise<Response> {
    const { userId, currentPassword, newPassword } = dto;
    const user = await this.authModel.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSame = await bcrypt.compare(newPassword, user.password);

    if (isSame) {
      throw new BadRequestException('New password must be different');
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    user.password = hashedPassword;
    // user.confirmPassword = hashedPassword;

    await user.save();

    return { success: true, message: 'Password changed successfully' };
  }
}
