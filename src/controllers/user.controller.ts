import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '@/services/user.service';
import { ResponseUtil } from '@/utils/response.util';
import { CreateUserInput, UpdateUserInput, SearchUserInput } from '@/schemas/user.schema';

export class UserController {
  static async createUser(
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply
  ) {
    const user = await UserService.createUser(request.body, (request as any).user?.id || 'system');
    return reply.send(ResponseUtil.success(user, 'User berhasil dibuat'));
  }

  static async getUsers(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply
  ) {
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '10');
    const users = await UserService.getAllUsers(page, limit);
    return reply.send(ResponseUtil.success(users));
  }

  static async getUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await UserService.getUserById(request.params.id);
    return reply.send(ResponseUtil.success(user));
  }

  static async updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserInput }>,
    reply: FastifyReply
  ) {
    const user = await UserService.updateUser(
      request.params.id,
      request.body,
      (request as any).user?.id || 'system'
    );
    return reply.send(ResponseUtil.success(user, 'User berhasil diupdate'));
  }

  static async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await UserService.deleteUser(
      request.params.id,
      (request as any).user?.id || 'system'
    );
    return reply.send(ResponseUtil.success(user, 'User berhasil dihapus'));
  }

  static async searchUsers(
    request: FastifyRequest<{ Querystring: SearchUserInput }>,
    reply: FastifyReply
  ) {
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '10');
    const users = await UserService.searchUsers(request.query.q, page, limit);
    return reply.send(ResponseUtil.success(users));
  }
}