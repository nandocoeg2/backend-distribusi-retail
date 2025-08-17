import { FastifyInstance } from 'fastify';
import { RoleController } from '@/controllers/role.controller';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', RoleController.getAll);
}