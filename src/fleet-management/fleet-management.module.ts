import { Module } from '@nestjs/common';
import { FleetManagementService } from './fleet-management.service';
import { FleetManagementController } from './fleet-management.controller';
import {
  FleetManagement,
  FleetManagementSchema,
} from './schema/fleet-management-schema';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FleetManagement.name, schema: FleetManagementSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  controllers: [FleetManagementController],
  providers: [FleetManagementService, MailService],
})
export class FleetManagementModule {}
