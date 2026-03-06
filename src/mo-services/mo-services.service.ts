import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ManPower } from './schema/mo-services-schema';
import { Model } from 'mongoose';
import { CreateMoServicesDto } from './dto/mo-services.dto';
import { MongoError } from 'mongodb';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MoServicesService {
  private readonly logger: Logger = new Logger(MoServicesService.name);
  constructor(
    @InjectModel(ManPower.name) private readonly manPowerModel: Model<ManPower>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async createManOutsourcing(dto: CreateMoServicesDto): Promise<ManPower> {
    try {
      // Check if a similar request already exists (optional duplicate check)
      const existingRequest = await this.manPowerModel.findOne({
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        companyName: dto.companyName,
      });

      if (existingRequest) {
        // You can decide if you want to allow multiple requests from same company
        // For now, we'll just log it but still create the request
        console.log('Similar request already exists for this company');
      }

      // Create and save the new manpower request
      const newManPower = new this.manPowerModel({
        ...dto,
        // Convert staff to number if needed, though schema stores as string
        staff: dto.staff.toString(),
      });

      const savedManPower = await newManPower.save();
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || '';

      // Email notification to admin about new manpower request
      try {
        await this.mailService.sendTemplateEmail(
          adminEmail,
          'New Manpower Request',
          'mo-services-admin',
          { ...dto },
        );
        this.logger.log(`Notification email sent to admin: ${adminEmail}`);
      } catch (error) {
        this.logger.error('Failed to send notification email:', error);
      }

      return savedManPower;
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new ConflictException('A similar request already exists');
      }

      throw new InternalServerErrorException(
        'Failed to create manpower request',
      );
    }
  }

  async getAllManPowerRequests(): Promise<ManPower[]> {
    return this.manPowerModel.find().sort({ createdAt: -1 }).exec();
  }

  async getManPowerRequestById(id: string): Promise<ManPower> {
    const request = await this.manPowerModel.findById(id).exec();
    if (!request) {
      throw new Error('Manpower request not found');
    }
    return request;
  }

  async getRequestsByCompany(companyName: string): Promise<ManPower[]> {
    return this.manPowerModel
      .find({ companyName })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateRequestStatus(id: string, status: string): Promise<ManPower> {
    const updatedRequest = await this.manPowerModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!updatedRequest) {
      throw new Error('Manpower request not found');
    }

    return updatedRequest;
  }

  private sendNotificationEmail(manPower: ManPower): void {
    console.log('Sending notification email for:', manPower.email);

    const emailContent = `
    New Manpower Request Received:
    
    Name: ${manPower.name}
    Email: ${manPower.email}
    Phone: ${manPower.phoneNumber}
    Company: ${manPower.companyName}
    Industry: ${manPower.industry}
    Staff Needed: ${manPower.staff}
    Duration: ${manPower.duration}
    
    Additional Details:
    ${manPower.details}
  `;

    console.log(emailContent);
  }
}
