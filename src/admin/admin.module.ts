import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schema/admin-schema';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { NotificationsModule } from '../notifications/notifications.module';
// Same secret the JWT strategy verifies with (process.env.SECRET_KEY).
import { JWT_SECRET } from '../auth/jwt.constants';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy, SuperAdminGuard],

  exports: [AdminService, JwtModule, PassportModule],
})
export class AdminModule {}
