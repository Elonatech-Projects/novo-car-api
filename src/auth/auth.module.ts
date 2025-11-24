import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schema/auth-schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key',
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
