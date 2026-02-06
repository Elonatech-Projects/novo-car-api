import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShuttleBooking,
  ShuttleBookingSchema,
} from './schema/shuttle-booking.schema';
import { Pricing, PricingSchema } from '../pricing/pricing.schema';
import { ShuttleBookingService } from './shuttle-booking.service';
import { ShuttleBookingController } from './shuttle-booking.controller';
import { PricingAdminService } from './admin/pricing.admin.service';
import { PricingAdminController } from './admin/pricing.admin.controller';
import { PricingModule } from '../pricing/pricing.module';
import { MapsModule } from '../maps/maps.module';
// import { MapsService } from '../maps/maps.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShuttleBooking.name, schema: ShuttleBookingSchema },
      { name: Pricing.name, schema: PricingSchema },
    ]),
    PricingModule,
    MapsModule,
  ],
  controllers: [ShuttleBookingController, PricingAdminController],
  providers: [ShuttleBookingService, PricingAdminService],
})
export class ShuttleBookingModule {}
