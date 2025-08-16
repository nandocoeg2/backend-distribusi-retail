import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { UserController } from '@/controllers/user.controller';
import { validateRequest } from '@/middleware/validate-request';
import { getUserSchema } from '@/schemas/user.schema';

export const userRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get('/', { preHandler: [fastify.authenticate] }, UserController.getUsers);
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getUserSchema)],
    },
    UserController.getUser
  );

  done();
};