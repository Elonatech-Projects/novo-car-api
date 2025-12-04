// // import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { verify } from 'jsonwebtoken';
// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Request } from 'express';

// // Extend Express Request interface to include 'user'
// declare module 'express-serve-static-core' {
//   interface Request {
//     user?: Record<string, any>;
//   }
// }

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest<Request>();

//     const rawAuthHeader = request.headers['authorization'] as
//       string |
//       string[] |
//       undefined;
//     const authHeader: string | undefined = Array.isArray(rawAuthHeader)
//       ? rawAuthHeader[0]
//       : rawAuthHeader;

//     if (!authHeader) {
//       throw new UnauthorizedException('No authorization header provided');
//     }

//     const token = authHeader.split(' ')[1]; // "Bearer <token>"

//     if (!token) {
//       throw new UnauthorizedException('No token provided');
//     }

//     try {
//       const verificationResult = (
//         verify as unknown as (token: string, secret: string) => unknown
//       )(token, process.env.JWT_SECRET ?? 'default_secret');
//       if (
//         typeof verificationResult === 'object' &&
//         verificationResult !== null
//       ) {
//         request.user = verificationResult as Record<string, any>; // attach decoded user to request
//       } else {
//         request.user = { token: verificationResult };
//       }
//       return true;
//     } catch {
//       throw new UnauthorizedException('Invalid or expired token');
//     }
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
