import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AirportTransferService } from './airport-transfer.service';
import { AirportTransferController } from './airport-transfer.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  AirportTransfer,
  AirportTransferSchema,
} from './schema/airport-transfer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AirportTransfer.name, schema: AirportTransferSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AirportTransferController],
  providers: [AirportTransferService],
})
export class AirportTransferModule {}
