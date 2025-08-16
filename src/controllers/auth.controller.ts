import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserInput, LoginInput } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/app-error';

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
      const data = await AuthService.login(request.body);
      return reply.send(data);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) {
        throw new AppError('Refresh token not found', 401);
      }
      await AuthService.logout(request.user.id, refreshToken);
      return reply.clearCookie('refreshToken').send({ message: 'Logged out successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  }
}