// src/common/interfaces/request-with-raw-body.ts
import { Request } from 'express';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}
