import { Module } from '@nestjs/common';
import { RoundTripService } from './round-trip.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { Round, RoundTrip } from './schema/round-trip-schema';
import { RoundTripController } from './round-trip.controller';
import { JwtStrategy } from '../auth/jwt/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: Round.name, schema: RoundTrip },
    ]),
  ],
  controllers: [RoundTripController],
  providers: [RoundTripService, JwtStrategy],
})
export class RoundTripModule {}
