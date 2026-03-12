import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OdSchoolService } from './od-school.service';
import { OdSchoolController } from './od-school.controller';
import { MailService } from '../mail/mail.service';
import { ODSchool, ODSchoolSchema } from './schema/od-school.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ODSchool.name, schema: ODSchoolSchema },
    ]),
  ],
  providers: [OdSchoolService, MailService],
  controllers: [OdSchoolController],
})
export class OdSchoolModule {}
