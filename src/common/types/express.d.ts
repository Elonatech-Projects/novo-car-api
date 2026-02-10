// src/common/types/express.d.ts
import 'express';

declare module 'express' {
  export interface Request {
    rawBody?: Buffer;
  }
}
