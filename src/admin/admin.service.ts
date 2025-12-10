import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schema/admin-schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.admin.types';
import { Types } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
  ) { }

  // ============================
  // Create Admin (NO TOKEN RETURNED)
  // ============================
  async createAdmin(createAdminDto: { email: string; password: string }) {
    const { email, password } = createAdminDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingAdmin = await this.adminModel.findOne({ email });
    if (existingAdmin) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.adminModel.create({
      email,
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
  // Login Admin (ONLY HERE RETURN TOKEN)
  // ============================
  async loginAdmin(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const registeredAdmin = await this.adminModel.findOne({ email });
    if (!registeredAdmin) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, registeredAdmin.password);
    if (!passwordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: registeredAdmin.email,
      sub: String(registeredAdmin._id),
    };

    // Generate JWT token ONLY on login
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
