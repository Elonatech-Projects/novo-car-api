import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from './schema/booking.schema';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      {name: Auth.name, schema: AuthSchema}
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
