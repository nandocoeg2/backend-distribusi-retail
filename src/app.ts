import Fastify from 'fastify';
import { z } from 'zod';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cookie from '@fastify/cookie';
import logger from '@/config/logger';
import { errorHandler } from '@/middleware/error.middleware';
import routes from '@/routes';
import { authMiddleware } from '@/middleware/auth.middleware';

export const createApp = async () => {
  const app = Fastify({
    logger: false, // We'll use Winston instead
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register plugins
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '900000', 10),
  });

  // Register cookies plugin
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'my-secret-key',
    parseOptions: {},
  });

  // Swagger documentation
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Backend Distribusi Retail API',
        description:
          'Robust backend application with Node.js, TypeScript, Fastify, Prisma, Redis, and Winston',
        version: '1.0.0',
      },
      host: 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter JWT Bearer token',
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });

  // Global hooks
  app.addHook('onRequest', async (request, reply) => {
    logger.info(`${request.method} ${request.url}`, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  });

  app.addHook('onResponse', async (request, reply) => {
    logger.info(`${request.method} ${request.url} - ${reply.statusCode}`, {
      responseTime: reply.elapsedTime,
    });
  });

  // Register middleware
  await app.register(authMiddleware);

  // Register routes
  await app.register(routes, { prefix: '/api/v1' });

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  });

  return app;
};

export type App = Awaited<ReturnType<typeof createApp>>;
