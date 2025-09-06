import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import {
  createInventoryHandler,
  getAllInventoriesHandler,
  getInventoryByIdHandler,
  updateInventoryHandler,
  deleteInventoryHandler,
  searchInventoriesHandler,
} from '@/controllers/inventory.controller';
import {
  createInventorySchema,
  getOrDeleteInventorySchema,
  updateInventorySchema,
  getAllInventoriesSchema,
  searchInventorySchema,
  GetAllInventoriesInput,
  SearchInventoryInput,
} from '@/schemas/inventory.schema';
import { validateRequest } from '@/middleware/validate-request';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

export const inventoryRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.post<{ Body: CreateInventoryInput }>(
    '/',
    {
      schema: createInventorySchema,
      preHandler: [fastify.authenticate, validateRequest(createInventorySchema)],
    },
    createInventoryHandler
  );

  fastify.get<{ Querystring: GetAllInventoriesInput['query'] }>(
    '/',
    {
      schema: getAllInventoriesSchema,
      preHandler: [fastify.authenticate, validateRequest(getAllInventoriesSchema)],
    },
    getAllInventoriesHandler
  );

  fastify.get<{ Querystring: SearchInventoryInput['query'] }>(
    '/search',
    {
      schema: searchInventorySchema,
      preHandler: [fastify.authenticate, validateRequest(searchInventorySchema)],
    },
    searchInventoriesHandler
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: getOrDeleteInventorySchema,
      preHandler: [fastify.authenticate, validateRequest(getOrDeleteInventorySchema)],
    },
    getInventoryByIdHandler
  );

  fastify.put<{ Body: UpdateInventoryInput['body']; Params: { id: string } }>(
    '/:id',
    {
      schema: updateInventorySchema,
      preHandler: [fastify.authenticate, validateRequest(updateInventorySchema)],
    },
    updateInventoryHandler
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: getOrDeleteInventorySchema,
      preHandler: [fastify.authenticate, validateRequest(getOrDeleteInventorySchema)],
    },
    deleteInventoryHandler
  );

  done();
};

