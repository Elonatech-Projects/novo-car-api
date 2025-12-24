import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /** ✅ PAYSTACK WEBHOOK RAW BODY */
  // app.use('/payments/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use('/payments/webhook', json({ 
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  }));

  /** ✅ CORS */
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://novo-index-page-re-do.vercel.app',
    ],
    credentials: true,
  });

  /** ✅ GLOBAL VALIDATION */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(4000);
}
bootstrap();
