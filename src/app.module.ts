import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { ShuttleServicesModule } from './shuttle-services/shuttle-services.module';
import { FleetManagementModule } from './fleet-management/fleet-management.module';
import { CareerJobsModule } from './career-jobs/career-jobs.module';
import { AdminModule } from './admin/admin.module';
import { RoundTripModule } from './round-trip/round-trip.module';
import { OneWayModule } from './one-way/one-way.module';
import { TripModule } from './shuttle-trip/trip.module';
import { CarRentalsModule } from './car-rentals/car-rentals.module';
// import { AdminBookingController } from './admin-booking/admin-booking.controller';
import { AdminBookingModule } from './admin-booking/admin-booking.module';
import { GuestBookingModule } from './guest-booking/guest-booking.module';

@Module({
  imports: [
    AuthModule,
    BookingModule,
    FleetManagementModule,
    CareerJobsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('MONGO_URL');

        if (url) {
          console.log('✅ Connecting to MongoDB...');
          // console.log(`🔗 Connection string: ${url}`);
        } else {
          console.error(
            ' Failed to connect MONGO_URL is not defined in your file',
          );
        }

        return {
          uri: url,
        };
      },
      inject: [ConfigService],
    }),

    ShuttleServicesModule,

    CareerJobsModule,

    AdminModule,

    RoundTripModule,

    OneWayModule,
    TripModule,
    CarRentalsModule,
    AdminBookingModule,
    GuestBookingModule,
  ],
  // controllers: [AdminBookingController],
})
export class AppModule {}
