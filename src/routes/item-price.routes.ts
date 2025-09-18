import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { ItemPriceController } from '../controllers/item-price.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  createItemPriceSchema,
  CreateItemPriceInput,
  deleteItemPriceSchema,
  getItemPriceSchema,
  searchItemPriceSchema,
  updateItemPriceSchema,
  UpdateItemPriceInput,
  GetAllItemPricesInput,
  getAllItemPricesSchema,
} from '../schemas/item-price.schema';

export const itemPriceRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Querystring: GetAllItemPricesInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(searchItemPriceSchema)],
    },
    ItemPriceController.searchItemPrices
  );

  fastify.post<{ Body: CreateItemPriceInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createItemPriceSchema)],
    },
    ItemPriceController.createItemPrice
  );

  fastify.get<{ Querystring: GetAllItemPricesInput['query'] }>('/', {
    preHandler: [fastify.authenticate, validateRequest(getAllItemPricesSchema)]
  }, ItemPriceController.getItemPrices);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getItemPriceSchema)],
    },
    ItemPriceController.getItemPrice
  );

  fastify.put<{ Params: { id: string }; Body: UpdateItemPriceInput['body'] }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(updateItemPriceSchema)],
    },
    ItemPriceController.updateItemPrice
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(deleteItemPriceSchema)],
    },
    ItemPriceController.deleteItemPrice
  );

  done();
};
