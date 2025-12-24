// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './user-booking/booking.module';
import { ShuttleServicesModule } from './shuttle-services/shuttle-services.module';
import { FleetManagementModule } from './fleet-management/fleet-management.module';
import { CareerJobsModule } from './career-jobs/career-jobs.module';
import { AdminModule } from './admin/admin.module';
import { RoundTripModule } from './round-trip/round-trip.module';
import { OneWayModule } from './one-way/one-way.module';
import { TripModule } from './shuttle-trip/trip.module';
import { CarRentalsModule } from './car-rentals/car-rentals.module';
import { AdminBookingModule } from './admin-booking/admin-booking.module';
import { GuestBookingModule } from './guest-booking/guest-booking.module';
import { MoServicesModule } from './mo-services/mo-services.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { RawBodyMiddleware } from './middlewares/raw-body.middleware';

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
    BookingModule,
    ShuttleServicesModule,
    FleetManagementModule,
    CareerJobsModule,
    AdminModule,
    RoundTripModule,
    OneWayModule,
    TripModule,
    CarRentalsModule,
    AdminBookingModule,
    GuestBookingModule,
    MoServicesModule,
    BookingsModule,
    PaymentsModule, // This module should contain the controllers
  ],
  // 🔥 REMOVE controllers and providers from here
  // They should be in their respective modules
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware).forRoutes('payments/webhook');
  }
}
