import type { AdminRole } from './schema/admin-schema';

export interface JwtPayload {
  sub: string; // admin ID
  email: string;
  role?: AdminRole;
}

export interface JwtUser {
  _id: string;
  email: string;
  role?: AdminRole;
}
