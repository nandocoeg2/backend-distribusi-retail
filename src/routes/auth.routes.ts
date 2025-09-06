import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { AuthController } from '@/controllers/auth.controller';
import { validateRequest } from '@/middleware/validate-request';
import { createUserSchema, loginSchema } from '@/schemas/auth.schema';
import { CreateUserInput, LoginInput } from '@/schemas/auth.schema';

export const authRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.post<{ Body: CreateUserInput }>(
    '/register',
    { preHandler: [validateRequest(createUserSchema)] },
    AuthController.register
  );

  fastify.post<{ Body: LoginInput }>(
    '/login',
    { preHandler: [validateRequest(loginSchema)] },
    AuthController.login
  );

  fastify.post('/logout', { preHandler: [fastify.authenticate] }, AuthController.logout);

  done();
};
