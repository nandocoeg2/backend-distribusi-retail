import { FastifyReply, FastifyRequest } from 'fastify';
import { RoleService } from '@/services/role.service';
import { updateRoleMenusSchema } from '@/schemas/role.schema';

export class RoleController {
  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    const roles = await RoleService.getAll();
    return reply.send(roles);
  }

  static async updateRoleMenus(request: FastifyRequest, reply: FastifyReply) {
    const { role, menu } = request.body as { role: string; menu: string[] };

    const updatedRole = await RoleService.updateRoleMenus(role, menu);

    return reply.send(updatedRole);
  }
}
