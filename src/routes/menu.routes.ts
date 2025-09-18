import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { MenuController } from '@/controllers/menu.controller';

export const menuRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get('/', { preHandler: [fastify.authenticate] }, MenuController.getAll);
  done();
};