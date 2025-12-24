import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /** ✅ NORMAL JSON PARSER (MUST COME FIRST) */
  app.use(json());

  /** ✅ PAYSTACK WEBHOOK RAW BODY (ONLY THIS ROUTE) */
  app.use(
    '/payments/webhook',
    json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

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
