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
  // Production/staging origins are an explicit allow-list. Any
  // http://localhost:<port> origin is always allowed on top of that — local
  // dev ports change constantly, and CORS here only guards browser-side
  // cookie/session access; this API auths via JWT bearer tokens, not
  // cookies, so a permissive localhost allowance carries no real risk.
  // (Deliberately NOT gated on NODE_ENV — this project runs with
  // NODE_ENV=production even for local dev, so that flag isn't a reliable
  // signal here.)
  const allowedOrigins = [
    'https://novo-index-page-re-do.vercel.app',
    'https://novo.ng',
    'https://www.novo.ng',
    'https://nshuttle.vercel.app',
    'https://nshuttle.novo.ng',
    'https://control.novo.ng',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // No Origin header — same-origin requests, curl, server-to-server, etc.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
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
