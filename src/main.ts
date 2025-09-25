import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_CONFIG } from './config';
import morgan from 'morgan';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Swagger
  const documentFactory = () =>
    SwaggerModule.createDocument(app, SWAGGER_CONFIG);
  SwaggerModule.setup('docs', app, documentFactory);

  app.use(morgan('dev'));

  await app.listen(PORT, () => {
    logger.log(`Server is running on http://localhost:${PORT}/api/v1`);
    logger.log(`Swagger: http://localhost:${PORT}/api/docs`);
    logger.log(`Node Environment: ${process.env?.NODE_ENV}`);
  });
}
bootstrap();
