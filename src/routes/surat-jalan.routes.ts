import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { SuratJalanController } from '@/controllers/surat-jalan.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createSuratJalanSchema,
  CreateSuratJalanInput,
  deleteSuratJalanSchema,
  getSuratJalanByIdSchema,
  updateSuratJalanSchema,
  UpdateSuratJalanInput,
  SearchSuratJalanInput,
  searchSuratJalanSchema,
} from '@/schemas/surat-jalan.schema';

export const suratJalanRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  options,
  done
) => {
  fastify.get<{ Querystring: SearchSuratJalanInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(searchSuratJalanSchema)],
    },
    SuratJalanController.searchSuratJalan
  );

  fastify.post<{ Body: CreateSuratJalanInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createSuratJalanSchema)],
    },
    SuratJalanController.createSuratJalan
  );

  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    SuratJalanController.getAllSuratJalan
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getSuratJalanByIdSchema)],
    },
    SuratJalanController.getSuratJalanById
  );

  fastify.put<{ Params: { id: string }; Body: UpdateSuratJalanInput['body'] }>(
    '/:id',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(updateSuratJalanSchema),
      ],
    },
    SuratJalanController.updateSuratJalan
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(deleteSuratJalanSchema),
      ],
    },
    SuratJalanController.deleteSuratJalan
  );

  done();
};
