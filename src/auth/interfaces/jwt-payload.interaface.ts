// src/auth/interfaces/jwt-payload.interface.ts

import { UserRole } from '../../common/enums/user-role.enum';

export interface JwtUser {
  sub: string; // user id
  email: string;
  role: UserRole;
}
