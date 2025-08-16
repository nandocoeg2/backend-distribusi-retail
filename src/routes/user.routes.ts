import { FastifyInstance, FastifyPluginOptions, Done } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validate-request';
import { getUserSchema } from '../schemas/user.schema';

export const userRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: Done) => {
  fastify.get('/', { preHandler: [fastify.authenticate] }, UserController.getUsers);
  fastify.get(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getUserSchema)],
    },
    UserController.getUser
  );

  done();
};