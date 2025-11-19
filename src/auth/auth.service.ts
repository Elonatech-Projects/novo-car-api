import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateAuthDto } from './dto/create-auth-dto';
import { Auth } from './schema/auth-schema';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
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

    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
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
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      _id: user._id,
    };
  }

  async LoginUser(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password needed');
    }

    const registeredUser = await this.authModel.findOne({ email });
    if (!registeredUser) {
      throw new BadRequestException('Invalid crendentials');
    }

    const checkPassword = await bcrypt.compare(password, registeredUser.password);
    if (!checkPassword) {
      throw new BadRequestException('Invalid crendentials');
    }

    console.log('check-password', checkPassword);

    return {
      message: 'Log in success',
      success: true,
      registeredUser,
    };
  }
}
