import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';

export class UserController {
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.getAllUsers();
    return reply.send(users);
  }

  static async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await UserService.getUserById(request.params.id);
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    return reply.send(user);
  }
}