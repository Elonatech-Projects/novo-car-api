// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ShuttleServicesModule } from './shuttle-services/shuttle-services.module';
import { FleetManagementModule } from './fleet-management/fleet-management.module';
import { CareerJobsModule } from './career-jobs/career-jobs.module';
import { AdminModule } from './admin/admin.module';
import { RoundTripModule } from './round-trip/round-trip.module';
import { OneWayModule } from './one-way/one-way.module';
import { TripModule } from './shuttle-trip/trip.module';
import { CarRentalsModule } from './car-rentals/car-rentals.module';
import { GuestBookingModule } from './guest-booking/guest-booking.module';
import { MoServicesModule } from './mo-services/mo-services.module';
import { PaymentsModule } from './payments/payments.module';
import { TripsModule } from './trips/trips.module';
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

    AuthModule,
    BookingModule,
    ShuttleServicesModule,
    FleetManagementModule,
    CareerJobsModule,
    AdminModule,
    RoundTripModule,
    OneWayModule,
    TripModule,
    CarRentalsModule,
    GuestBookingModule,
    MoServicesModule,
    PaymentsModule,
    TripsModule,
    PaystackBookingsModule,
  ],
})
export class AppModule {} // ← REMOVE implements NestModule and configure method
