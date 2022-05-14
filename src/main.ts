import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as xss from 'xss-clean';
import * as hpp from 'hpp';
import * as cors from 'cors';
import * as rateLimit from 'express-rate-limit'; //rate
import { ValidationErrorFilter } from './common/filters/validation-error.filter';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
// import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// require('dotenv').config();
export const routePrefix = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors());

  app.setGlobalPrefix(routePrefix);

  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalFilters(new ValidationErrorFilter());
  // app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());

  app.use(helmet()); // Set security HTTP headers

  // TODO: Add CSRF Security Feature
  // app.use(csurf())

  const limiter = rateLimit.default({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: {
      message: 'Too many requests from this IP, please try again in an hour!',
      error: 'Too Many Requests',
    },
  });

  app.use('/api/*', limiter);

  // Body parser, reading data from body into req.body
  app.use(express.json({ limit: '10kb' }));

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());

  // Serving static files
  app.use(express.static(`${__dirname}/public`));

  // 404 Error
  // app.all('*', (req, res, next) => {
  //   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  // });

  const config = new DocumentBuilder()
    .addOAuth2()
    .addBearerAuth()
    .setTitle('RealXState')
    .setDescription('Api documentation for RealXState application')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${routePrefix}/docs`, app, document);
  // writeFileSync('./schema.json', JSON.stringify(document), { flag: 'a+' })
  // console.log({ config, document })

  await app.listen(process.env?.PORT || 5000);
}

bootstrap();
