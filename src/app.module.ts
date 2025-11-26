import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
// import { Booking } from './booking/schema/booking.schema';
import { ShuttleServicesModule } from './shuttle-services/shuttle-services.module';
// import { FleetManagementController } from './fleet-management/fleet-management.controller';
import { FleetManagementModule } from './fleet-management/fleet-management.module';

@Module({
  imports: [
    AuthModule,
    BookingModule,
    FleetManagementModule,
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
  ],
})
export class AppModule {}
