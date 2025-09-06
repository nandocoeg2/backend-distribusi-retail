import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { BulkPurchaseOrderController } from '@/controllers/bulk-purchase-order.controller';
import { validateRequest } from '@/middleware/validate-request';
import { getBulkUploadStatusSchema, getBulkUploadsSchema } from '@/schemas/bulk-purchase-order.schema';

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

  fastify.get(
    '/bulk/all',
    {
      preHandler: [fastify.authenticate, validateRequest(getBulkUploadsSchema)],
    },
    BulkPurchaseOrderController.getAllBulkFiles
  );

  done();
};

