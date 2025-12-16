import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoServicesService } from './mo-services.service';
import { MoServicesController } from './mo-services.controller';
import { ManPower, ManPowerSchema } from './schema/mo-services-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManPower.name, schema: ManPowerSchema },
    ]),
  ],
  controllers: [MoServicesController],
  providers: [MoServicesService],
  exports: [MoServicesService],
})
export class MoServicesModule {}
