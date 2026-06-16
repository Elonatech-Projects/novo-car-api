// main.ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 🔥 RAW BODY FOR WEBHOOK (MUST BE FIRST!)
  app.use(
    '/payments/webhook',
    bodyParser.raw({
      type: 'application/json',
      verify: (req: any, res: any, buf: Buffer) => {
        req.rawBody = buf; // Attach raw buffer to request
      },
    }),
  );

  // Normal JSON for other routes
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://novo-index-page-re-do.vercel.app',
      'https://novo.ng',
      'https://www.novo.ng',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Webhook: http://localhost:${port}/payments/webhook`);
}

bootstrap();
