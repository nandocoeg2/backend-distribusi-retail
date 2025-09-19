import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { PackingController } from '@/controllers/packing.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createPackingSchema,
  CreatePackingInput,
  deletePackingSchema,
  getPackingSchema,
  updatePackingSchema,
  UpdatePackingInput,
  SearchPackingInput,
  searchPackingSchema,
} from '@/schemas/packing.schema';

export const packingRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  options,
  done
) => {
  fastify.get<{ Querystring: SearchPackingInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['Packing'],
        querystring: searchPackingSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchPackingSchema)],
    },
    PackingController.searchPackings
  );

  fastify.post<{ Body: CreatePackingInput }>(
    '/',
    {
      schema: {
        tags: ['Packing'],
        body: createPackingSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createPackingSchema)],
    },
    PackingController.createPacking
  );

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Packing'],
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    PackingController.getPackings
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Packing'],
        params: getPackingSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getPackingSchema)],
    },
    PackingController.getPacking
  );

  fastify.put<{ Params: { id: string }; Body: UpdatePackingInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Packing'],
        params: updatePackingSchema.shape.params,
        body: updatePackingSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(updatePackingSchema),
      ],
    },
    PackingController.updatePacking
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Packing'],
        params: deletePackingSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(deletePackingSchema),
      ],
    },
    PackingController.deletePacking
  );

  done();
};
