import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
// import { Booking } from './booking/schema/booking.schema';
import { ShuttleServicesModule } from './shuttle-services/shuttle-services.module';
// import { FleetManagementController } from './fleet-management/fleet-management.controller';
import { FleetManagementModule } from './fleet-management/fleet-management.module';
// import { CareerJobsController } from './career-jobs/career-jobs.controller';
// import { CareerJobsService } from './career-jobs/career-jobs.service';
import { CareerJobsModule } from './career-jobs/career-jobs.module';
import { AdminModule } from './admin/admin.module';
// import { RoundModule } from './trip/round/round.module';
// import { RoundTripController } from './round-trip/round-trip.controller';
import { RoundTripModule } from './round-trip/round-trip.module';
import { OneWayModule } from './one-way/one-way.module';
// import { SearchShuttleController } from './search-shuttle/search-shuttle.controller';
// import { SearchShuttleService } from './search-shuttle/search-shuttle.service';
// import { SearchShuttleModule } from './search-shuttle/search-shuttle.module';
// import { ShuttleTripController } from './shuttle-trip/trip.controller';
// import { ShuttleTripService } from './shuttle-trip/trip.service';
// import { ShuttleTripModule } from './shuttle-trip/shuttle-trip.module';
// import { RoundTripModule } from './round-trip/round-trip.module';
import { TripModule } from './shuttle-trip/trip.module';

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

    // RoundModule,

    RoundTripModule,

    OneWayModule,
    TripModule,

    // SearchShuttleModule,

    // ShuttleTripModule,
  ],
  // controllers: [SearchShuttleController, ShuttleTripController],
  // providers: [SearchShuttleService, ShuttleTripService],
  // controllers: [RoundTripController],
  // controllers: [CareerJobsController],
  // providers: [CareerJobsService],
})
export class AppModule {}
