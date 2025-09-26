import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { DimensiKardusController } from '@/controllers/dimensi-kardus.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createDimensiKardusSchema,
  updateDimensiKardusSchema,
  getAllDimensiKardusSchema,
  searchDimensiKardusSchema,
  getDimensiKardusSchema,
  CreateDimensiKardusInput,
  UpdateDimensiKardusInput,
  GetAllDimensiKardusInput,
  SearchDimensiKardusInput,
} from '@/schemas/dimensi-kardus.schema';

export const dimensiKardusRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  // Create
  fastify.post<{ Body: CreateDimensiKardusInput }>(
    '/',
    {
      schema: {
        tags: ['Dimensi Kardus'],
        body: createDimensiKardusSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createDimensiKardusSchema)],
    },
    DimensiKardusController.create
  );

  // Get all with pagination
  fastify.get<{ Querystring: GetAllDimensiKardusInput['query'] }>(
    '/',
    {
      schema: {
        tags: ['Dimensi Kardus'],
        querystring: getAllDimensiKardusSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    DimensiKardusController.getAll
  );

  // Search
  fastify.get<{ Querystring: SearchDimensiKardusInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['Dimensi Kardus'],
        querystring: searchDimensiKardusSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchDimensiKardusSchema)],
    },
    DimensiKardusController.search
  );

  // Get by id
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Dimensi Kardus'],
        params: getDimensiKardusSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getDimensiKardusSchema)],
    },
    DimensiKardusController.getById
  );

  // Update
  fastify.put<{ Params: { id: string }; Body: UpdateDimensiKardusInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Dimensi Kardus'],
        params: updateDimensiKardusSchema.shape.params,
        body: updateDimensiKardusSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(updateDimensiKardusSchema)],
    },
    DimensiKardusController.update
  );

  // Delete
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Dimensi Kardus'],
        params: updateDimensiKardusSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(updateDimensiKardusSchema)],
    },
    DimensiKardusController.delete
  );

  done();
};


