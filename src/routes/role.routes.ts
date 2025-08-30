import { FastifyInstance } from 'fastify';
import { RoleController } from '@/controllers/role.controller';
import { updateRoleMenusSchema } from '@/schemas/role.schema';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', RoleController.getAll);
  fastify.put(
    '/menus',
    {
      schema: {
        body: updateRoleMenusSchema,
      },
    },
    RoleController.updateRoleMenus
  );
}
