import { DocumentBuilder } from '@nestjs/swagger';

const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle('Travel Booking')
  .setDescription('Travel Booking API.')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter token in the format: Bearer <token>',
      name: 'Authorization',
      in: 'header',
    },
    'JWT',
  )
  .build();

export default SWAGGER_CONFIG;
