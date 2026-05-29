// Car rentals service
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserCarForm } from './schema/car-rentals.schema';
import { Model } from 'mongoose';
import { Auth } from '../auth/schema/auth-schema';
import { CarRentalsDto } from './dto/car-rentals.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../notifications/sms/sms.service';

@Injectable()
export class CarRentalsService {
  private readonly logger = new Logger(CarRentalsService.name);
  private readonly companySender: string;
  private readonly companyPhone: string;

  constructor(
    @InjectModel(UserCarForm.name)
    private readonly carRentalModel: Model<UserCarForm>,
    @InjectModel(Auth.name)
    private readonly userModel: Model<Auth>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {
    this.companySender =
      this.configService.get<string>('TERMII_SENDER_ID_COMPANY') ?? 'Novo';
    this.companyPhone =
      this.configService.get<string>('NOVO_COMPANY_PHONE') ?? '2349072711009';
  }

  async createCarRentals(dto: CarRentalsDto) {
    // Destructure all fields including optional
    const {
      bookingCategory,
      bookingModel,
      name,
      email,
      phoneNumber,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      dropoffDate,
      notes,
      subModel,
      rentalDuration,
    } = dto;

    // Check required fields only
    const requiredFields = {
      bookingCategory,
      bookingModel,
      name,
      email,
      phoneNumber,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      dropoffDate,
      notes,
      // rentalDuration, // optional
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null) {
        throw new BadRequestException(`${key} is required`);
      }
    }

    // Validate dates
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time

    if (pickup < today) {
      throw new BadRequestException('Pickup date cannot be in the past.');
    }

    if (dropoff <= pickup) {
      throw new BadRequestException('Dropoff must be after pickup date.');
    }

    // Build rental object
    const carRentalData = {
      bookingCategory,
      bookingModel,
      name,
      email,
      phoneNumber,
      pickupLocation,
      dropoffLocation,
      pickupDate: pickup,
      dropoffDate: dropoff,
      notes,
      subModel: subModel || null, // optional
      rentalDuration: rentalDuration || null, // optional
      // userId: user._id,
    };

    // Save to DB
    const createdCarRental = await this.carRentalModel.create(carRentalData);

    try {
      await this.mailService.sendTemplateEmail(
        dto.email,
        'Car Rental Request Received - Novo Cars',
        'car-rentals',
        {
          ...dto,
          pickupDate: pickup.toDateString(),
          dropoffDate: dropoff.toDateString(),
        },
      );
    } catch (error) {
      this.logger.error('Email failed:', error);
    }

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured — skipping admin email.');
    } else {
      await this.mailService.sendTemplateEmail(
        adminEmail,
        'New Car Rental Booking - Novo Cars',
        'car-rentals-admin',
        { ...dto },
      );
    }

    try {
      // SMS notification to internal ops team
      const smsMessage =
        `Novo: New car rental request!\n\n` +
        `From: ${dto.name}\n` +
        `Phone: ${dto.phoneNumber}\n` +
        `Pickup: ${dto.pickupLocation} on ${pickup.toDateString()}\n` +
        `Dropoff: ${dto.dropoffLocation} on ${dropoff.toDateString()}`;

      await this.smsService.sendSms(
        [this.companyPhone], // Novo Cars internal ops phone
        smsMessage,
        this.companySender,
      );
      this.logger.log(
        `Car rental SMS notification sent to company (${this.companyPhone})`,
      );
    } catch (error) {
      this.logger.error(
        'Car Rentals SMS failed:',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      message: 'Car rental created successfully',
      success: true,
      createdCarRental,
    };
  }
}
