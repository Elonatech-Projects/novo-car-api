import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { BookingController } from './booking.controller';
// import { BookingService } from './booking.service';
// import { Booking, BookingSchema } from './schema/userbooking.schema';
// import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { JwtStrategy } from '../auth/jwt/jwt.strategy';
// import { createAdminBooking } from '../admin-booking/schema/adminbooking.schema';
// import { AdminService } from '../admin/admin.service';
import { UserBooking, UserBookingSchema } from './schema/userbooking.schema';
import { UserBookingController } from './booking.controller';
import { UserBookingService } from './booking.service';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserBooking.name, schema: UserBookingSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  controllers: [UserBookingController],
  providers: [UserBookingService, JwtStrategy],
})
export class BookingModule {}
