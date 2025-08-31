import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { StatusController } from '@/controllers/status.controller';

export const statusRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) => {
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatuses
  );

  done();
};
