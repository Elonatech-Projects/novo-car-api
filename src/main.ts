// main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { winstonLogger } from './common/logger/winston.logger';

async function bootstrap() {
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
      'https://novo-index-page-re-do.vercel.app',
    ],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📍 Webhook: http://localhost:${port}/payments/webhook`);
}

bootstrap();