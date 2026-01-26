// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
// import { BookingModule } from './user-booking/booking.module';
import { ShuttleServicesModule } from './shuttle-services/shuttle-services.module';
import { FleetManagementModule } from './fleet-management/fleet-management.module';
import { CareerJobsModule } from './career-jobs/career-jobs.module';
import { AdminModule } from './admin/admin.module';
import { RoundTripModule } from './round-trip/round-trip.module';
import { OneWayModule } from './one-way/one-way.module';
import { TripModule } from './shuttle-trip/trip.module';
import { CarRentalsModule } from './car-rentals/car-rentals.module';
// import { AdminBookingModule } from './admin-booking/admin-booking.module';
import { GuestBookingModule } from './guest-booking/guest-booking.module';
import { MoServicesModule } from './mo-services/mo-services.module';
// import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { RawBodyMiddleware } from './middlewares/raw-body.middleware';
// import { TripsService } from './trips/trips.service';
// import { TripsController } from './trips/trips.controller';
import { TripsModule } from './trips/trips.module';
// import { BookingService } from './booking/booking.service';
// import { BookingController } from './booking/booking.controller';
// import { BookingModule } from './booking/booking.module';
// import { LegacyBookingService } from './legacy-booking/legacy-booking.service';
// import { LegacyBookingController } from './legacy-booking/legacy-booking.controller';
// import { LegacyBookingModule } from './legacy-booking/legacy-booking.module';
// import { PaystackBookingsController } from './paystack-bookings/paystack-bookings.controller';
// import { PaystackBookingsService } from './paystack-bookings/paystack-bookings.service';
import { PaystackBookingsModule } from './paystack-bookings/paystack-bookings.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('MONGO_URL');
        const fallbackUrl = 'mongodb://localhost:27017/booking';

        if (url) {
          console.log('✅ Connecting to MongoDB...');
        } else {
          console.log('⚠️ Using fallback MongoDB URL');
        }

        return {
          uri: url || fallbackUrl,
        };
      },
      inject: [ConfigService],
    }),

    // All your feature modules
    AuthModule,
    // BookingModule,
    BookingModule,
    ShuttleServicesModule,
    FleetManagementModule,
    CareerJobsModule,
    AdminModule,
    RoundTripModule,
    OneWayModule,
    TripModule,
    CarRentalsModule,
    // AdminBookingModule,
    GuestBookingModule,
    MoServicesModule,
    // BookingsModule,
    PaymentsModule,
    TripsModule,
    // LegacyBookingModule,
    PaystackBookingsModule, // This module should contain the controllers
  ],
  // providers: [PaystackBookingsService],
  // controllers: [PaystackBookingsController],
  // providers: [TripsService],
  // controllers: [TripsController],
  // 🔥 REMOVE controllers and providers from here
  // They should be in their respective modules
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware).forRoutes('payments/webhook');
  }
}
