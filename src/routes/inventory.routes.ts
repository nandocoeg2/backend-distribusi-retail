import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { InventoryController } from '@/controllers/inventory.controller';
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
      schema: {
        tags: ['Inventory'],
        body: createInventorySchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createInventorySchema)],
    },
    InventoryController.create
  );

  fastify.get<{ Querystring: GetAllInventoriesInput['query'] }>(
    '/',
    {
      schema: {
        tags: ['Inventory'],
        querystring: getAllInventoriesSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getAllInventoriesSchema)],
    },
    InventoryController.getAll
  );

  fastify.get<{ Querystring: SearchInventoryInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['Inventory'],
        querystring: searchInventorySchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchInventorySchema)],
    },
    InventoryController.search
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Inventory'],
        params: getOrDeleteInventorySchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getOrDeleteInventorySchema)],
    },
    InventoryController.getById
  );

  fastify.put<{ Body: UpdateInventoryInput['body']; Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Inventory'],
        params: updateInventorySchema.shape.params,
        body: updateInventorySchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(updateInventorySchema)],
    },
    InventoryController.update
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Inventory'],
        params: getOrDeleteInventorySchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getOrDeleteInventorySchema)],
    },
    InventoryController.delete
  );

  done();
};
