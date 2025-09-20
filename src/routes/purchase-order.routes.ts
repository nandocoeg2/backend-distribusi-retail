import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { PurchaseOrderController } from '@/controllers/purchase-order.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createPurchaseOrderSchema,
  CreatePurchaseOrderInput,
  deletePurchaseOrderSchema,
  getPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
  searchPurchaseOrderSchema,
  HistoryPurchaseOrderInput,
  processPurchaseOrderSchema,
  ProcessPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';

export const purchaseOrderRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  options,
  done
) => {
  fastify.get<{ Querystring: SearchPurchaseOrderInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['Purchase Order'],
        querystring: searchPurchaseOrderSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchPurchaseOrderSchema)],
    },
    PurchaseOrderController.searchPurchaseOrders
  );

  fastify.post<{ Body: CreatePurchaseOrderInput }>(
    '/',
    {
      schema: {
        tags: ['Purchase Order'],
        consumes: ['multipart/form-data'],
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    PurchaseOrderController.createPurchaseOrder
  );

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Purchase Order'],
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    PurchaseOrderController.getPurchaseOrders
  );

  fastify.get<{ Querystring: HistoryPurchaseOrderInput }>(
    '/history',
    {
      schema: {
        tags: ['Purchase Order'],
        querystring: searchPurchaseOrderSchema.shape.query, // This might need a specific schema
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    PurchaseOrderController.getHistoryPurchaseOrders
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Purchase Order'],
        params: getPurchaseOrderSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getPurchaseOrderSchema)],
    },
    PurchaseOrderController.getPurchaseOrder
  );

  fastify.put<{ Params: { id: string }; Body: UpdatePurchaseOrderInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Purchase Order'],
        params: updatePurchaseOrderSchema.shape.params,
        body: updatePurchaseOrderSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(updatePurchaseOrderSchema),
      ],
    },
    PurchaseOrderController.updatePurchaseOrder
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Purchase Order'],
        params: deletePurchaseOrderSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(deletePurchaseOrderSchema),
      ],
    },
    PurchaseOrderController.deletePurchaseOrder
  );

  fastify.patch<{ Body: ProcessPurchaseOrderInput['body'] }>(
    '/process',
    {
      schema: {
        tags: ['Purchase Order'],
        body: processPurchaseOrderSchema.shape.body,
        security: [{ Bearer: [] }],
        description: 'Process purchase orders by providing array of IDs in body'
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(processPurchaseOrderSchema),
      ],
    },
    PurchaseOrderController.processPurchaseOrder
  );

  done();
};
