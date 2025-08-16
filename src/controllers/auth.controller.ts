import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserInput, LoginInput } from '@/schemas/auth.schema';
import { AuthService } from '@/services/auth.service';
import { AppError } from '@/utils/app-error';

export class AuthController {
  static async register(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    try {
      const user = await AuthService.register(request.body);
      return reply.code(201).send(user);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  }

  static async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const { accessToken, refreshToken, user } = await AuthService.login(request.body);

      reply.setCookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return reply.send({ user });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        throw new AppError('User not authenticated', 401);
      }
      await AuthService.logout(request.user.id);
      reply.clearCookie('accessToken');
      reply.clearCookie('refreshToken');
      return reply.send({ message: 'Logged out successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  }
}