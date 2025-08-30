import { FastifyInstance } from 'fastify';
import { RoleController } from '@/controllers/role.controller';
import { validateRequest } from '@/middleware/validate-request';
import { createRoleSchema, updateRoleMenusSchema } from '@/schemas/role.schema';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', RoleController.getAll);
  fastify.post(
    '/',
    { preHandler: [validateRequest(createRoleSchema)] },
    RoleController.create
  );
  fastify.put(
    '/:roleId/menus',
    { preHandler: [validateRequest(updateRoleMenusSchema)] },
    RoleController.updateMenus
  );
  fastify.delete('/:roleId', RoleController.delete);
}
