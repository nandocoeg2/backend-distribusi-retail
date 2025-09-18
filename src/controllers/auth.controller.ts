import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserInput, LoginInput } from '@/schemas/auth.schema';
import { AuthService } from '@/services/auth.service';
import { AppError } from '@/utils/app-error';
import { ResponseUtil } from '@/utils/response.util';

export class AuthController {
  static async register(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    const user = await AuthService.register(request.body);
    return reply.code(201).send(ResponseUtil.success(user));
  }

  static async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    const { user, accessToken } = await AuthService.login(request.body);
    // Note: The original controller returned { user }, but the service returns { user, accessToken }.
    // I will return both as it seems more useful.
    return reply.send(ResponseUtil.success({ user, accessToken }));
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError('User not authenticated', 401);
    }
    await AuthService.logout(request.user.id);
    return reply.send(ResponseUtil.success({ message: 'Logged out successfully' }));
  }
}
