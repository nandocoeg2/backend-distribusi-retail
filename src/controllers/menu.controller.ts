import { FastifyReply, FastifyRequest } from 'fastify';
import { MenuService } from '@/services/menu.service';
import { ResponseUtil } from '@/utils/response.util';

export class MenuController {
  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    const menus = await MenuService.getAll();
    return reply.send(ResponseUtil.success(menus));
  }
}