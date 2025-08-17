import { FastifyInstance } from 'fastify';
import { MenuController } from '@/controllers/menu.controller';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', MenuController.getAll);
}