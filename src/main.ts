import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_CONFIG } from './config';
import morgan from 'morgan';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { QueryExceptionFilter } from './filters/query-exception.filter';
import { AllExceptionsFilter } from './filters/all-exception.filter';
import { isDebugMode } from './common/utils/helper';
import { WinstonModule } from 'nest-winston';
import winstonConfig from './config/logger.config';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import cookieParser from 'cookie-parser';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { json, urlencoded } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    rawBody: true,
  });
  const PORT = process.env.PORT || 3000;
  const logger = new Logger('Bootstrap');

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  // Initialize transactional context
  initializeTransactionalContext();

  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Helmet for secure HTTP headers
  app.use(helmet());

  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // cookie parser middleware to parse cookies
  app.use(cookieParser());

  // global interceptor
  app.useGlobalInterceptors(
    new TransformResponseInterceptor(), // Interceptor for Success to apply consistent response format
    new LoggingInterceptor(), // logging interceptor
    new ClassSerializerInterceptor(app.get(Reflector)), // Enable ClassSerializerInterceptor globally to serialize responses
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Swagger
  const documentFactory = () => SwaggerModule.createDocument(app, SWAGGER_CONFIG);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, // keeps the auth token between page reloads
    },
  });

  app.use(morgan('dev'));

  // Register filters globally
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new QueryExceptionFilter(),
    new AllExceptionsFilter(),
  );

  await app.listen(PORT, '0.0.0.0', () => {
    logger.log(`Server is running on http://localhost:${PORT}/api/v1`);
    logger.log(`Swagger: http://localhost:${PORT}/api/docs`);
    logger.log(`Node Environment: [${process.env?.NODE_ENV}]`);
    logger.log(`Debug Mode:[${isDebugMode()}]`);
  });
}
bootstrap();
