import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schema/admin-schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async createAdmin(createAdminDto: { email: string; password: string }) {
    const { email, password } = createAdminDto;
    const fields = { email, password };

    if (!email || !password) {
      throw new BadRequestException('All fields are required');
    }
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }
    const existingAdmin = await this.adminModel.findOne({ email });
    if (existingAdmin) {
      throw new BadRequestException('Email already registered');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const data = { ...createAdminDto, password: hashedPassword };
    const admin = await this.adminModel.create(data);

    return {
      message: 'Admin created successfully',
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    };
  }
  async loginAdmin(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const registeredAdmin = await this.adminModel.findOne({ email });
    if (!registeredAdmin) {
      throw new BadRequestException('Invalid credentials');
    }
    const checkPassword = await bcrypt.compare(password, registeredAdmin.password);
    if (!checkPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { email: registeredAdmin.email, sub: registeredAdmin._id };
    const token = this.jwtService.sign(payload);
    console.log('Generated JWT Token:', token);

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
