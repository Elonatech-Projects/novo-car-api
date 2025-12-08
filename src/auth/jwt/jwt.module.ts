import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JWT_SECRET } from '../jwt.constants';

const expiresInSeconds = 24 * 60 * 60;

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: expiresInSeconds },
    }),
  ],
  exports: [JwtModule],
})
export class MyJwtModule {}
