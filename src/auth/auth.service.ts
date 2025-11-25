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
// import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
) {}

  async createUser(createAuthDto: CreateAuthDto) {
    const { name, email, password, confirmPassword, phoneNumber } = createAuthDto;

    const fields = {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
    };
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      throw new BadRequestException('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }
    const existing = await this.authModel.findOne({ email });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const confirmHarshPassword = await bcrypt.hash(confirmPassword, salt);

    const data = {
      ...createAuthDto,
      password: hashedPassword,
      confirmPassword: confirmHarshPassword,
    };

    const user = await this.authModel.create(data);

    return {
      message: 'Document created',
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  async loginUser(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password needed');
    }

    const registeredUser = await this.authModel.findOne({ email });
    if (!registeredUser) {
      throw new BadRequestException('Invalid credentials');
    }

    const checkPassword = await bcrypt.compare(password, registeredUser.password);
    if (!checkPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      sub: String(registeredUser._id),
      _id: String(registeredUser._id),
      email: registeredUser.email,
    };
    const token = this.jwtService.sign(payload);
    console.log('check-password', checkPassword);

    return {
      message: 'Log in success',
      success: true,
      token: token,
      user: {
        name: registeredUser.name,
        email: registeredUser.email,
        phoneNumber: registeredUser.phoneNumber,
        _id: registeredUser._id,
      },
    };
  }
}
