import { ValidationPipeOptions } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';

// The validation schema for environment variables
const envValidationSchema = Joi.object({
  // GENERAL
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .trim(),

  // DATABASE
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});

const ENV_CONFIG: ConfigModuleOptions<ValidationPipeOptions> = {
  validationSchema: envValidationSchema,
  isGlobal: true,
  envFilePath: join(
    __dirname,
    '../..',
    'env',
    `${process.env.NODE_ENV || 'development'}.env`,
  ),
};

export default ENV_CONFIG;
