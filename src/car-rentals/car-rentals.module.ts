import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarRentalsService } from './car-rentals.service';
import { CarRentalsController } from './car-rentals.controller';
import { UserCarForm, CarRentalsSchema } from './schema/car-rentals.schema';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../notifications/sms/sms.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserCarForm.name, schema: CarRentalsSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  providers: [CarRentalsService, MailService, SmsService],
  controllers: [CarRentalsController],
})
export class CarRentalsModule {}
