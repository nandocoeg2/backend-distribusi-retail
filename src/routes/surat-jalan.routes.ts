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
      schema: {
        tags: ['Surat Jalan'],
        querystring: searchSuratJalanSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchSuratJalanSchema)],
    },
    SuratJalanController.searchSuratJalan
  );

  fastify.post<{ Body: CreateSuratJalanInput }>(
    '/',
    {
      schema: {
        tags: ['Surat Jalan'],
        body: createSuratJalanSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createSuratJalanSchema)],
    },
    SuratJalanController.createSuratJalan
  );

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Surat Jalan'],
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    SuratJalanController.getAllSuratJalan
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Surat Jalan'],
        params: getSuratJalanByIdSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getSuratJalanByIdSchema)],
    },
    SuratJalanController.getSuratJalanById
  );

  fastify.put<{ Params: { id: string }; Body: UpdateSuratJalanInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Surat Jalan'],
        params: updateSuratJalanSchema.shape.params,
        body: updateSuratJalanSchema.shape.body,
        security: [{ Bearer: [] }],
      },
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
      schema: {
        tags: ['Surat Jalan'],
        params: deleteSuratJalanSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(deleteSuratJalanSchema),
      ],
    },
    SuratJalanController.deleteSuratJalan
  );

  done();
};
