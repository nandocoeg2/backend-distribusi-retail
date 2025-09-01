import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { FileController } from '@/controllers/file.controller';
import { validateRequest } from '@/middleware/validate-request';
import { getFileSchema } from '@/schemas/file.schema';

export const fileRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Params: { id: string } }>(
    '/download/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getFileSchema)],
    },
    FileController.downloadFile
  );

  done();
};
