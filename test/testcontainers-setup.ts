process.env.NODE_ENV = 'test';
process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../env/test.env') });

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RabbitMQContainer, StartedRabbitMQContainer } from '@testcontainers/rabbitmq'
import { AppModule } from '../src/app.module';
import { TransformResponseInterceptor } from '../src/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import { RedisService } from '../src/common/redis/redis.service';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { initializeTransactionalContext, addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
export interface TestAppContext {
  app: INestApplication;
  redisContainer: StartedRedisContainer;
  postgresContainer?: StartedPostgreSqlContainer;
  redisService: RedisService;
  rabbitMqContainer?: StartedRabbitMQContainer;
}

export interface SetupOptions {
  withDatabase?: boolean;
  withRabbitMQ?: boolean;
}


/**
 * Creates a NestJS test application with Redis (and optionally Postgres).
 */
export async function setupTestApp(options: SetupOptions = {}): Promise<TestAppContext> {
  const { withDatabase = false, withRabbitMQ = false } = options;

  // ✅ REQUIRED for typeorm-transactional
  initializeTransactionalContext();

  // -------------------- Redis --------------------
  console.log('🚀 Starting Redis container...');

  const redisContainer = await new RedisContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .withStartupTimeout(120000)
    .start()

  // console.log(`✅ Redis started at ${redisContainer.getHost()}:${redisContainer.getPort()}`);
  console.log(`✅ Redis started at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);


  // Override Redis env vars
  process.env.REDIS_HOST = redisContainer.getHost();
  process.env.REDIS_PORT = redisContainer.getPort().toString();


  // -------------------- Postgres --------------------
  let postgresContainer: StartedPostgreSqlContainer | undefined;

  if (withDatabase) {
    console.log('🚀 Starting Postgres container...');

    postgresContainer = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('travel_booking')
      .withUsername('postgres')
      .withPassword('postgres')
      .withExposedPorts(5432)
      .withStartupTimeout(120000)
      .start();


    // Override Postgres env vars
    process.env.DB_HOST = postgresContainer.getHost();
    process.env.DB_PORT = postgresContainer.getMappedPort(5432).toString();
    // console.log(`✅ Postgres started at ${postgresContainer.getHost()}:${postgresContainer.getPort()}`);
    console.log(`✅ Postgres started at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  }

  // -------------------- RabbitMQ --------------------
  let rabbitMqContainer: StartedRabbitMQContainer | undefined;

  if (withRabbitMQ) {
    console.log('🚀 Starting RabbitMQ container...');

    rabbitMqContainer = await new RabbitMQContainer('rabbitmq:3-management')
      .withExposedPorts(5672)
      .start();

    process.env.RABBITMQ_HOST = rabbitMqContainer.getHost();
    process.env.RABBITMQ_PORT = rabbitMqContainer.getMappedPort(5672).toString();
    process.env.RABBITMQ_USER = 'user';
    process.env.RABBITMQ_PASSWORD = 'password';
    process.env.RABBIT_MQ_URI = rabbitMqContainer.getAmqpUrl();
    console.log(`✅ RabbitMQ started at ${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`);
  }

  // -------------------- NestJS --------------------
  console.log('🔧 Creating NestJS test module...');

  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  const moduleFixture: TestingModule = await moduleBuilder.compile();

  const app = moduleFixture.createNestApplication();

  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(cookieParser());

  await app.init();

  console.log('✅ NestJS app initialized');

  const redisService = app.get<RedisService>(RedisService);

  return {
    app,
    redisContainer,
    postgresContainer,
    redisService,
    rabbitMqContainer
  };
}

/**
 * Clear all tables in the database.
 */
export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);

    // truncate table and reset sequences
    await repository.query(
      `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`
    );
  }
}

/**
 * Stops all containers and closes NestJS app.
 */
export async function teardownTestApp(context: TestAppContext | undefined): Promise<void> {
  if (!context) {
    console.warn('⚠️  No context to teardown');
    return;
  }

  try {
    if (context.app) {
      console.log('🔒 Closing NestJS app...');
      await context.app.close();
    }
    if (context.postgresContainer) {
      console.log('🛑 Stopping Postgres container...');
      await context.postgresContainer.stop();
    }

    if (context.redisContainer) {
      console.log('🛑 Stopping Redis container...');
      await context.redisContainer.stop();
    }

    if (context.rabbitMqContainer) {
      console.log('🛑 Stopping RabbitMQ container...');
      await context.rabbitMqContainer.stop();
    }

    console.log('✅ Teardown complete');
  } catch (error) {
    console.error('❌ Error during teardown:', error);
  }
}