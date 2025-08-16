import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';
import { createUserSchema, loginUserSchema } from '../schemas/user.schema';

export const authRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: any) => {
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