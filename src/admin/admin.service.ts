// Admin Service
// src\admin\admin.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schema/admin-schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.admin.types';
import { CreateAdminDto } from './dto/create-admin-dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { NotificationService } from '../notifications/notifications.service';

const BCRYPT_ROUNDS = 12;

// Hard cap on how many super admins can exist. Keeps the privileged group small.
const MAX_SUPER_ADMINS = 4;

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  // ============================
  // Bootstrap — seed the FIRST super admin (one-time)
  // ============================
  // Only works when (a) there are zero admins in the DB AND (b) the provided
  // setupKey matches process.env.ADMIN_SETUP_KEY. After the first admin exists,
  // this endpoint permanently refuses — new admins must be created by a
  // logged-in super admin.
  async bootstrap(dto: BootstrapAdminDto) {
    const setupKey = process.env.ADMIN_SETUP_KEY;

    if (!setupKey) {
      throw new ForbiddenException('Bootstrap is not configured');
    }

    if (dto.setupKey !== setupKey) {
      throw new ForbiddenException('Invalid setup key');
    }

    const adminCount = await this.adminModel.estimatedDocumentCount();
    if (adminCount > 0) {
      throw new ForbiddenException(
        'Bootstrap already completed. Ask an existing super admin to create new admins.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const admin = await this.adminModel.create({
      name: dto.name?.trim(),
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
    });

    this.logger.log(`Bootstrap super admin created: ${admin.email}`);

    return {
      success: true,
      message: 'Super admin created successfully',
      admin: { id: admin._id, email: admin.email, role: admin.role },
    };
  }

  // ============================
  // Create Admin (super admin only — enforced at the controller)
  // ============================
  async createAdmin(
    dto: CreateAdminDto,
    creator: { id: string; email: string },
  ) {
    const email = dto.email.toLowerCase().trim();
    const role = dto.role ?? 'admin';

    const existingAdmin = await this.adminModel.findOne({ email });
    if (existingAdmin) {
      throw new BadRequestException('Email already registered');
    }

    // Enforce the super-admin cap.
    if (role === 'super_admin') {
      const superCount = await this.adminModel.countDocuments({
        role: 'super_admin',
      });
      if (superCount >= MAX_SUPER_ADMINS) {
        throw new BadRequestException(
          `Maximum of ${MAX_SUPER_ADMINS} super admins reached`,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const admin = await this.adminModel.create({
      name: dto.name?.trim(),
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdBy: creator.id,
    });

    this.logger.log(`Admin created: ${admin.email} (by ${creator.email})`);

    // Notify the super admin who created this account (fire-and-forget).
    this.notificationService
      .sendEmail({
        to: creator.email,
        subject: `New admin created — ${admin.email}`,
        template: 'admin-created',
        context: {
          name: admin.name ?? 'N/A',
          email: admin.email,
          role: admin.role,
          createdBy: creator.email,
          date: new Date().toLocaleString(),
        },
      })
      .catch((err) =>
        this.logger.error('Failed to send admin-created email', err),
      );

    return {
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  // ============================
  // List all admins (super admin only)
  // ============================
  async listAdmins() {
    return this.adminModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // ============================
  // Enable / disable an admin (super admin only)
  // ============================
  async setAdminStatus(id: string, isActive: boolean, actingAdminId: string) {
    if (id === actingAdminId) {
      throw new BadRequestException('You cannot change your own status');
    }

    const admin = await this.adminModel.findById(id).exec();
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Guard: never disable the last active super admin.
    if (admin.role === 'super_admin' && !isActive) {
      const activeSupers = await this.adminModel.countDocuments({
        role: 'super_admin',
        isActive: true,
      });
      if (activeSupers <= 1) {
        throw new BadRequestException(
          'Cannot disable the last active super admin',
        );
      }
    }

    admin.isActive = isActive;
    await admin.save();

    this.logger.log(
      `Admin ${admin.email} ${isActive ? 'enabled' : 'disabled'} by ${actingAdminId}`,
    );

    return {
      success: true,
      message: `Admin ${isActive ? 'enabled' : 'disabled'} successfully`,
      admin: { id: admin._id, email: admin.email, isActive: admin.isActive },
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

    // Same exception for "not found" and "wrong password" — don't leak which
    // emails exist.
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

    // Disabled admins cannot log in. Treat only an explicit `false` as disabled
    // so legacy records created before this field existed still work.
    if (registeredAdmin.isActive === false) {
      throw new UnauthorizedException(
        'Account is disabled. Contact a super admin.',
      );
    }

    const payload: JwtPayload = {
      email: registeredAdmin.email,
      sub: String(registeredAdmin._id),
      role: registeredAdmin.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      success: true,
      token,
      admin: {
        id: registeredAdmin._id,
        name: registeredAdmin.name,
        email: registeredAdmin.email,
        role: registeredAdmin.role,
      },
    };
  }

  async verifyAdmin(adminId: string) {
    const admin = await this.adminModel
      .findById(adminId)
      .select('-password')
      .lean()
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Guard: disabled admins cannot use their token
    if (admin.isActive === false) {
      throw new UnauthorizedException(
        'Account is disabled. Contact a super admin.',
      );
    }

    this.logger.debug(`Token verified for admin: ${admin.email}`);

    return {
      success: true,
      message: 'Token is valid',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
