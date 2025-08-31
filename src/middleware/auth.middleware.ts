import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken } from '@/utils/jwt.utils';
import { AppError } from '@/utils/app-error';
import { prisma } from '@/config/database';

const authMiddlewarePlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication failed. No token provided.', 401);
      }

      const accessToken = authHeader.substring(7);

      const { decoded, expired } = verifyToken(accessToken);

      if (expired || !decoded) {
        throw new AppError('Authentication failed. Invalid or expired token.', 401);
      }

      if (typeof decoded === 'string' || !decoded.sub) {
        throw new AppError('Invalid token.', 401);
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.sub as string } });
      if (!user) {
        throw new AppError('User not found', 401);
      }

      request.user = {
        id: user.id,
        iat: decoded.iat || 0,
        exp: decoded.exp || 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      reply.code(401).send({ error: 'Unauthorized: Invalid token' });
    }
  });
};

export const authMiddleware = fp(authMiddlewarePlugin);
