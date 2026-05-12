import { Module } from '@nestjs/common';
import { AirportTransferService } from './airport-transfer.service';
import { AirportTransferController } from './airport-transfer.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AirportTransferController],
  providers: [AirportTransferService],
})
export class AirportTransferModule {}
