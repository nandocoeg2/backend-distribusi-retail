import { FastifyReply, FastifyRequest } from 'fastify';
import { RoleService } from '@/services/role.service';

export class RoleController {
  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    const roles = await RoleService.getAll();
    return reply.send(roles);
  }
}