import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { AuthController } from '@/controllers/auth.controller';
import { validateRequest } from '@/middleware/validate-request';
import { createUserSchema, loginUserSchema } from '@/schemas/user.schema';

export const authRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.post(
    '/register',
    { preHandler: [validateRequest(createUserSchema)] },
    AuthController.register
  );

  fastify.post(
    '/login',
    { preHandler: [validateRequest(loginUserSchema)] },
    AuthController.login
  );

  fastify.post('/logout', { preHandler: [fastify.authenticate] }, AuthController.logout);

  done();
};