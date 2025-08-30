import { RoleService } from '@/services/role.service';
import { FastifyRequest, FastifyReply } from 'fastify';

export class RoleController {
  static async getAll(req: FastifyRequest, reply: FastifyReply) {
    const roles = await RoleService.getAll();
    reply.code(200).send(roles);
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const { name, menuIds } = req.body as { name: string; menuIds: string[] };
    const newRole = await RoleService.create(name, menuIds);
    reply.code(201).send(newRole);
  }

  static async updateMenus(req: FastifyRequest, reply: FastifyReply) {
    const { roleId } = req.params as { roleId: string };
    const { menuIds } = req.body as { menuIds: string[] };
    const updatedRole = await RoleService.updateMenus(roleId, menuIds);
    reply.code(200).send(updatedRole);
  }

  static async delete(req: FastifyRequest, reply: FastifyReply) {
    const { roleId } = req.params as { roleId: string };
    await RoleService.delete(roleId);
    reply.code(204).send();
  }
}
