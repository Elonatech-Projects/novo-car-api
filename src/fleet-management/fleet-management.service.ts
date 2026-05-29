import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  FleetManagement,
  FleetManagementDocument,
} from './schema/fleet-management-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Auth } from '../auth/schema/auth-schema';
import { CreateFleetManagementDto } from './dto/create-fleet-management.dto';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notifications/notifications.service';
import { SmsService } from '../notifications/sms/sms.service';

@Injectable()
export class FleetManagementService {
  private readonly logger = new Logger(FleetManagementService.name);
  private readonly companySender: string;
  private readonly companyPhone: string;

  constructor(
    @InjectModel(FleetManagement.name)
    private fleetManagementModel: Model<FleetManagementDocument>,
    @InjectModel(Auth.name) private userModel: Model<Auth>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
  ) {
    this.companySender =
      this.configService.get<string>('TERMII_SENDER_ID_COMPANY') ?? 'Novo';
    this.companyPhone =
      this.configService.get<string>('NOVO_COMPANY_PHONE') ?? '2349072711009';
  }

  async createFleetManagement(dto: CreateFleetManagementDto) {
    const { date } = dto;

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
      ...dto,
      cargoDescription: dto.cargoDescription || '',
      specialRequests: dto.specialRequests || '',
    };

    const createdFleet = await this.fleetManagementModel.create(fleetData);

    /* ---------- USER EMAIL -----------  */
    // try {
    //   await this.notificationService.sendEmail({
    //     to: dto.email,
    //     subject: 'Fleet Management Request Received - Novo Cars',
    //     template: 'fleet-management',
    //     context: { ...dto },
    //   });

    //   this.logger.log('Fleet Management Email sent');
    // } catch (error) {
    //   this.logger.error('Failed to send fleet management email to user', error);

    //   if (error instanceof Error) {
    //     this.logger.debug(error.stack);
    //   }
    // }

    const adminEmail = process.env.ADMIN_EMAIL || '';

    // ── Admin email ────────────────────────────────────────────────────────────
    try {
      await this.mailService.sendTemplateEmail(
        adminEmail,
        'New Fleet Management Booking - Novo Cars',
        'fleet-management-admin',
        { ...dto },
      );
    } catch (error) {
      this.logger.error('Failed to send fleet management admin email', error);
    }

    // ── Company SMS alert (sender: Novo) ───────────────────────────────────────
    // Sent to the Novo Cars ops number so the team sees new requests immediately.
    try {
      const smsMessage =
        `Novo: New fleet management request!\n\n` +
        `From: ${dto.name}\n` +
        `Phone: ${dto.phone}\n` +
        `Pickup: ${dto.pickup}\n` +
        `Destination: ${dto.destination}\n` +
        `Date: ${dto.date} at ${dto.time}\n` +
        `Passengers: ${dto.passengerCount}\n\n` +
        `Check your mail or dashboard for full details.`;

      await this.smsService.sendSMS(
        [this.companyPhone],
        smsMessage,
        this.companySender, // 'Novo' — company-facing sender ID
      );

      this.logger.log(
        `Fleet management SMS alert sent to company (${this.companyPhone})`,
      );
    } catch (error) {
      // SMS failure must never block the booking response
      this.logger.error(
        'Failed to send fleet management SMS alert to company',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      message: 'Fleet management booking created successfully',
      success: true,
      createdFleet,
    };
  }

  async findAll(): Promise<FleetManagement[]> {
    return this.fleetManagementModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.fleetManagementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new BadRequestException('Management not found');
    }

    return { success: true, message: 'Fleet Management deleted successfully' };
  }
}
