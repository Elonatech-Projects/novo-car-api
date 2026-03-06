import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoServicesService } from './mo-services.service';
import { MoServicesController } from './mo-services.controller';
import { ManPower, ManPowerSchema } from './schema/mo-services-schema';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManPower.name, schema: ManPowerSchema },
    ]),
  ],
  controllers: [MoServicesController],
  providers: [MoServicesService, MailService],
  exports: [MoServicesService],
})
export class MoServicesModule {}
