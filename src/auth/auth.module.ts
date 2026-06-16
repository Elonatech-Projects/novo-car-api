import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schema/auth-schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';
// Single source of truth for the JWT secret (reads process.env.SECRET_KEY).
// Signing MUST use the same secret the strategy verifies with.
import { JWT_SECRET } from './jwt.constants';

@Module({
  imports: [
    NotificationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

  // IMPORTANT: export AuthService + JwtModule only
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
