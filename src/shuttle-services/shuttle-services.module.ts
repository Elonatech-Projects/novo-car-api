import { Module } from '@nestjs/common';
import { ShuttleServicesController } from './shuttle-services.controller';
import { ShuttleServicesService } from './shuttle-services.service';
import { ShuttleServices, Shuttle } from './schema/shuttle-service-schema';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shuttle.name, schema: ShuttleServices },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  controllers: [ShuttleServicesController],
  providers: [ShuttleServicesService],
})
export class ShuttleServicesModule {}
