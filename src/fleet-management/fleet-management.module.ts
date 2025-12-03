import { Module } from '@nestjs/common';
import { FleetManagementService } from './fleet-management.service';
import { FleetManagementController } from './fleet-management.controller';
import {
  FleetManagement,
  FleetManagementSchema,
} from './schema/fleet-management-schema';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FleetManagement.name, schema: FleetManagementSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  controllers: [FleetManagementController],
  providers: [FleetManagementService],
})
export class FleetManagementModule {}
