import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken, reissueAccessToken } from '@/utils/jwt.utils';
import { environment } from '@/config/environment';
import { AppError } from '@/utils/app-error';
import { prisma } from '@/config/database';

const authMiddlewarePlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let accessToken = request.cookies.accessToken;

      if (!accessToken) {
        const refreshToken = request.cookies.refreshToken;
        if (!refreshToken) {
          throw new AppError('Authentication failed. No tokens provided.', 401);
        }

        const newAccessToken = await reissueAccessToken(refreshToken);
        if (!newAccessToken) {
          throw new AppError('Authentication failed. Could not refresh token.', 401);
        }

        reply.setCookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: environment.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });
        accessToken = newAccessToken;
      }

      let { decoded, expired } = verifyToken(accessToken);

      if (expired) {
        const refreshToken = request.cookies.refreshToken;
        if (!refreshToken) {
          throw new AppError('Authentication failed. No refresh token provided.', 401);
        }

        const newAccessToken = await reissueAccessToken(refreshToken);
        if (!newAccessToken) {
          throw new AppError('Authentication failed. Could not refresh token.', 401);
        }

        reply.setCookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: environment.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });

        const newDecoded = verifyToken(newAccessToken);
        decoded = newDecoded.decoded;
      }

      if (!decoded || typeof decoded === 'string' || !decoded.sub) {
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
