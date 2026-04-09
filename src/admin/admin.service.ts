// Admin Service
// src\admin\admin.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schema/admin-schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.admin.types';
import { CreateAdminDto } from './dto/create-admin-dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // ============================
  // Create Admin
  // ============================
  async createAdmin(createAdminDto: CreateAdminDto) {
    const { email, password } = createAdminDto;

    const existingAdmin = await this.adminModel.findOne({
      // ✅ Normalize email to lowercase before querying — matches schema's lowercase:true
      email: email.toLowerCase().trim(),
    });

    if (existingAdmin) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12); // ✅ Bumped from 10 to 12 rounds

    const admin = await this.adminModel.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return {
      message: 'Admin created successfully',
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    };
  }

  // ============================
  // Login Admin
  // ============================
  async loginAdmin(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const registeredAdmin = await this.adminModel.findOne({
      email: normalizedEmail,
    });

    /**
     * ✅ SECURITY FIX: Use the SAME exception type (UnauthorizedException)
     * for both "email not found" and "wrong password" cases.
     *
     * Using BadRequestException for one and UnauthorizedException for the
     * other leaks information — an attacker can tell whether an email exists
     * in your system based on the HTTP status code (400 vs 401).
     *
     * Always return 401 for any credential mismatch.
     */
    if (!registeredAdmin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      password,
      registeredAdmin.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: registeredAdmin.email,
      sub: String(registeredAdmin._id),
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      success: true,
      token,
      admin: {
        id: registeredAdmin._id,
        email: registeredAdmin.email,
      },
    };
  }
}
