import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '@/services/user.service';
import { ResponseUtil } from '@/utils/response.util';

export class UserController {
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.getAllUsers();
    return reply.send(ResponseUtil.success(users));
  }

  static async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await UserService.getUserById(request.params.id);
    return reply.send(ResponseUtil.success(user));
  }
}