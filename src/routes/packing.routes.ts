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
      preHandler: [fastify.authenticate, validateRequest(searchPackingSchema)],
    },
    PackingController.searchPackings
  );

  fastify.post<{ Body: CreatePackingInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createPackingSchema)],
    },
    PackingController.createPacking
  );

  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    PackingController.getPackings
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getPackingSchema)],
    },
    PackingController.getPacking
  );

  fastify.put<{ Params: { id: string }; Body: UpdatePackingInput['body'] }>(
    '/:id',
    {
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
      preHandler: [
        fastify.authenticate,
        validateRequest(deletePackingSchema),
      ],
    },
    PackingController.deletePacking
  );

  done();
};
