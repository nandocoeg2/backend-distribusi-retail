import { FastifyInstance } from 'fastify';
import { authRoutes } from '@/routes/auth.routes';
import { userRoutes } from '@/routes/user.routes';
import roleRoutes from '@/routes/role.routes';
import menuRoutes from '@/routes/menu.routes';

export default async (fastify: FastifyInstance) => {
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(roleRoutes, { prefix: '/roles' });
  fastify.register(menuRoutes, { prefix: '/menus' });
};