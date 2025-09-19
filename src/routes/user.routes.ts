import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { UserController } from '@/controllers/user.controller';
import { validateRequest } from '@/middleware/validate-request';
import { getUserSchema, getAllUsersSchema } from '@/schemas/user.schema';

export const userRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['User'],
        querystring: getAllUsersSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    UserController.getUsers
  );
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['User'],
        params: getUserSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getUserSchema)],
    },
    UserController.getUser
  );

  done();
};