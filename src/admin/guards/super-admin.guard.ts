// SuperAdminGuard
// src\admin\guards\super-admin.guard.ts
//
// Runs AFTER JwtAdminGuard (which authenticates the bearer token and attaches
// req.user). It then loads the admin from the DB and confirms they are an
// ACTIVE super_admin. We check the DB rather than trusting the token's role so
// that disabling/demoting an admin takes effect immediately, even on an
// already-issued token.

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../schema/admin-schema';
import type { JwtUser } from '../jwt.admin.types';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    const userId = req.user?._id;

    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    const admin = await this.adminModel.findById(userId).lean().exec();

    if (!admin || admin.isActive === false) {
      throw new ForbiddenException('Account is inactive');
    }

    if (admin.role !== 'super_admin') {
      throw new ForbiddenException('Super admin access required');
    }

    return true;
  }
}
