import { DocumentBuilder } from '@nestjs/swagger';

const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle('Travel Booking')
  .setDescription('Travel Booking API.')
  .setVersion('1.0')
  .build();

export default SWAGGER_CONFIG;
