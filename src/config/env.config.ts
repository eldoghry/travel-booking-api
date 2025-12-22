import { ValidationPipeOptions } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';

// The validation schema for environment variables
const envValidationSchema = Joi.object({
  // GENERAL
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development').trim(),
  DEBUG_MODE: Joi.boolean().default(false),

  // DATABASE
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // REDIS
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),

  // RABBITMQ
  RABBIT_MQ_URI: Joi.string().uri().required(),

  // KEYCLOAK
  KEYCLOAK_AUTH_URL: Joi.string().required(),
  KEYCLOAK_REALM: Joi.string().required(),
  KEYCLOAK_CLIENT_ID: Joi.string().required(),
  KEYCLOAK_CLIENT_SECRET: Joi.string().required(),

  //AMADEUS
  AMADEUS_API_KEY: Joi.string().required(),
  AMADEUS_API_SECRET: Joi.string().required(),
  AMADEUS_API_BASE_URL: Joi.string().uri().required(),

  //PAYPAL
  PAYPAL_BASE_URL: Joi.string().uri().required(),
  PAYPAL_CLIENT_ID: Joi.string().required(),
  PAYPAL_SECRET_KEY: Joi.string().required(),
  PAYPAL_REDIRECT_URL: Joi.string().uri().required(),
  PAYPAL_CANCEL_URL: Joi.string().uri().required(),
  PAYPAL_WEBHOOK_ID: Joi.string().required(),
  PAYPAL_MODE: Joi.string().valid('sandbox', 'live').required(),
});

const ENV_CONFIG: ConfigModuleOptions<ValidationPipeOptions> = {
  validationSchema: envValidationSchema,
  isGlobal: true,
  envFilePath: join(__dirname, '../..', 'env', `${process.env.NODE_ENV || 'development'}.env`),
};

export default ENV_CONFIG;
