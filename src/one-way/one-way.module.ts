import { Module } from '@nestjs/common';
import { OneWayController } from './one-way.controller';
import { OneWayService } from './one-way.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from '../auth/schema/auth-schema';
import { One, OneWay } from './schema/one-way-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: One.name, schema: OneWay },
    ]),
  ],
  controllers: [OneWayController],
  providers: [OneWayService],
})
export class OneWayModule {}
