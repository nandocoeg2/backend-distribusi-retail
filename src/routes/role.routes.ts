import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { RoleController } from '@/controllers/role.controller';
import { validateRequest } from '@/middleware/validate-request';
import { createRoleSchema, updateRoleMenusSchema, deleteRoleSchema } from '@/schemas/role.schema';

export const roleRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get('/', { preHandler: [fastify.authenticate] }, RoleController.getAll);
  fastify.post('/', { preHandler: [fastify.authenticate, validateRequest(createRoleSchema)] }, RoleController.create);
  fastify.put('/:roleId/menus', { preHandler: [fastify.authenticate, validateRequest(updateRoleMenusSchema)] }, RoleController.updateMenus);
  fastify.delete('/:roleId', { preHandler: [fastify.authenticate, validateRequest(deleteRoleSchema)] }, RoleController.delete);
  done();
};
