import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { BulkPurchaseOrderController } from '@/controllers/bulk-purchase-order.controller';
import { validateRequest } from '@/middleware/validate-request';
import { getBulkUploadStatusSchema } from '@/schemas/bulk-purchase-order.schema';

export const bulkPurchaseOrderRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  options,
  done
) => {
  fastify.post(
    '/bulk',
    {
      preHandler: [fastify.authenticate],
    },
    BulkPurchaseOrderController.bulkCreatePurchaseOrder
  );

  fastify.get<{ Params: { id: string } }>(
    '/bulk/status/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getBulkUploadStatusSchema)],
    },
    BulkPurchaseOrderController.getUploadStatus
  );

  done();
};

