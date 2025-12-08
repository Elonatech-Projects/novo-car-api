import {
  Injectable,
  BadRequestException,
  // UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { CreateAuthDto } from './dto/create-auth-dto';
import { Auth } from './schema/auth-schema';
import { InjectModel } from '@nestjs/mongoose';
import { JwtPayload } from './jwt.types';
import * as bcrypt from 'bcrypt';

export interface LoginResponse {
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
  ) { }

  async createUser(createAuthDto: CreateAuthDto) {
    const { name, email, password, confirmPassword, phoneNumber } = createAuthDto;

    // Basic validation
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      throw new BadRequestException('All fields are required');
    }
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.authModel.findOne({ email });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash passwords
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      ...createAuthDto,
      password: hashedPassword,
      confirmPassword: hashedPassword, 
    };

    // Save user
    const user = await this.authModel.create(userData);

    return {
      message: 'User created successfully',
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  async loginUser(email: string, password: string): Promise<LoginResponse> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const registeredUser = await this.authModel.findOne({ email });
    if (!registeredUser) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, registeredUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: String(registeredUser._id),
      email: registeredUser.email,
    };

    const token = this.jwtService.sign(payload);

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
}
