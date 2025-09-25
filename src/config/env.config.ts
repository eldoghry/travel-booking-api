import { ValidationPipeOptions } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';

// The validation schema for environment variables
const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .trim(),
});

export const envConfig: ConfigModuleOptions<ValidationPipeOptions> = {
  validationSchema: envValidationSchema,
  isGlobal: true,
  envFilePath: join(
    __dirname,
    '../..',
    'env',
    `${process.env.NODE_ENV || 'development'}.env`,
  ),
};
