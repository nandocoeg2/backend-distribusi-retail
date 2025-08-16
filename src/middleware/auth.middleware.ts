import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken } from '@/utils/jwt.utils';
import { environment } from '@/config/environment';
import { AppError } from '@/utils/app-error';
import { prisma } from '@/config/database';

const authMiddlewarePlugin = async (fastify: FastifyInstance) => {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const accessToken = request.cookies.accessToken;

        if (!accessToken) {
          throw new AppError('No token provided', 401);
        }

        const decoded = verifyToken(accessToken, environment.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
        });

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
    }
  );
};

export const authMiddleware = fp(authMiddlewarePlugin);
