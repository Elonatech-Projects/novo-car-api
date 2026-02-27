import { BadRequestException, Injectable } from '@nestjs/common';
import { FleetManagement } from './schema/fleet-management-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { CreateFleetManagementDto } from './dto/create-fleet-management.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class FleetManagementService {
  constructor(
    @InjectModel(FleetManagement.name)
    private fleetManagementModel: Model<FleetManagement>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
    private readonly mailService: MailService,
  ) {}

  async createFleetManagement(dto: CreateFleetManagementDto) {
    const {
      name,
      email,
      pickup,
      phone,
      destination,
      date,
      time,
      passengerCount,
      cargoDescription,
      specialRequests,
    } = dto;

    for (const [key, value] of Object.entries(dto)) {
      if (!value) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    // const user = await this.userModel.findById(userId).exec();
    // if (!user) {
    //   throw new BadRequestException('User not found');
    // }

    // Validate date
    const fleetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time

    if (fleetDate < today) {
      throw new BadRequestException(
        'Fleet management date cannot be in the past.',
      );
    }

    const fleetData = {
      name,
      email,
      phone,
      pickup,
      destination,
      date,
      time,
      passengerCount,
      cargoDescription,
      specialRequests,
      // notes:
      // notes,
      // user: user._id,
    };

    const createdFleet = await this.fleetManagementModel.create(fleetData);

    try {
      await this.mailService.sendTemplateEmail(
        dto.email,
        'Fleet Management Request Received - Novo Cars',
        'fleet-management',
        { ...dto},
      );
    } catch (error) {
      console.error('Failed to send fleet management email:', error);
    }

    const adminEmail = process.env.ADMIN_EMAIL || '';

    // Admin notification
    try {
      await this.mailService.sendTemplateEmail(
        adminEmail,
        'New Fleet Management Booking - Novo Cars',
        'fleet-management-admin',
        { ...dto },
      );
    } catch (error) {
      console.error('Failed to send fleet management admin email:', error);
    }

    return {
      message: 'Fleet management booking created successfully',
      success: true,
      createdFleet,
    };
  }
}
