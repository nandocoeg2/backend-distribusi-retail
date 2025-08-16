import { FastifyInstance } from 'fastify';
import { authRoutes } from '@/routes/auth.routes';
import { userRoutes } from '@/routes/user.routes';

export default async (fastify: FastifyInstance) => {
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(userRoutes, { prefix: '/users' });
};