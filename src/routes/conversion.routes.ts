import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { ConversionController } from '@/controllers/conversion.controller';

export const conversionRoutes: FastifyPluginCallback<FastifyPluginOptions> = (app, options, done) => {
  app.post(
    '/upload',
    {
      preHandler: [app.authenticate],
    },
    ConversionController.convertFile
  );
  done();
};
