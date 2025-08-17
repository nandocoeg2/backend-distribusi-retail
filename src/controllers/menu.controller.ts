import { FastifyReply, FastifyRequest } from 'fastify';
import { MenuService } from '@/services/menu.service';

export class MenuController {
  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    const menus = await MenuService.getAll();
    return reply.send(menus);
  }
}