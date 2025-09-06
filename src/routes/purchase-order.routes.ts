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
} from '@/schemas/purchase-order.schema';

export const purchaseOrderRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  options,
  done
) => {
  fastify.get<{ Querystring: SearchPurchaseOrderInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(searchPurchaseOrderSchema)],
    },
    PurchaseOrderController.searchPurchaseOrders
  );

  fastify.post<{ Body: CreatePurchaseOrderInput }>(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    PurchaseOrderController.createPurchaseOrder
  );

  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    PurchaseOrderController.getPurchaseOrders
  );

  fastify.get<{ Querystring: HistoryPurchaseOrderInput }>(
    '/history',
    {
      preHandler: [fastify.authenticate],
    },
    PurchaseOrderController.getHistoryPurchaseOrders
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getPurchaseOrderSchema)],
    },
    PurchaseOrderController.getPurchaseOrder
  );

  fastify.put<{ Params: { id: string }; Body: UpdatePurchaseOrderInput['body'] }>(
    '/:id',
    {
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
      preHandler: [
        fastify.authenticate,
        validateRequest(deletePurchaseOrderSchema),
      ],
    },
    PurchaseOrderController.deletePurchaseOrder
  );

  done();
};
