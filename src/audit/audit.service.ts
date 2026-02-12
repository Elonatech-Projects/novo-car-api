import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuditLog, AuditLogDocument } from './schema/audit-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  async log(action: string, payload: Partial<AuditLog>) {
    await this.auditModel.create({
      action,
      ...payload,
    });
  }
}
