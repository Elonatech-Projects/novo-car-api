// src/middlewares/raw-body.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Add rawBody property to request
    (req as any).rawBody = await this.getRawBody(req);
    next();
  }

  private getRawBody(req: Request): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        resolve(data);
      });

      req.on('error', reject);
    });
  }
}
