export interface JwtPayload {
  sub: string; // user ID
  email: string;
}

export interface JwtUser {
  _id: string;
  email: string;
}
