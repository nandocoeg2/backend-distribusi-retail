import { FastifyInstance } from 'fastify';
import { convertFileHandler } from '@/controllers/conversion.controller';
import { conversionSchema } from '@/schemas/conversion.schema';

export const conversionRoutes = async (app: FastifyInstance) => {
  app.post(
    '/convert',
    convertFileHandler
  );
};
