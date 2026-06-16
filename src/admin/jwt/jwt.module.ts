// JWT Module (Admin)
// src\admin\jwt\jwt.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// Same secret the JWT strategy verifies with (process.env.SECRET_KEY).
import { JWT_SECRET } from '../../auth/jwt.constants';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  exports: [JwtModule],
})
export class MyJwtModule {}
