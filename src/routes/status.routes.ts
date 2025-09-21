import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { StatusController } from '@/controllers/status.controller';

export const statusRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) => {
  // Get all statuses
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatuses
  );

  // Get all categories
  fastify.get(
    '/categories',
    { preHandler: [fastify.authenticate] },
    StatusController.getAllCategories
  );

  // Get statuses by category
  fastify.get<{ Params: { category: string } }>(
    '/category/:category',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatusesByCategory
  );

  // Get statuses by Purchase Order
  fastify.get(
    '/purchase_order',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatusesByPurchaseOrder
  );

  // Get statuses by Bulk File
  fastify.get(
    '/bulk_file',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatusesByBulkFile
  );

  // Get statuses by Packing
  fastify.get(
    '/packing',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatusesByPacking
  );

  // Get statuses by Packing Item
  fastify.get(
    '/packing_item',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatusesByPackingItem
  );

  // Get statuses by Invoice
  fastify.get(
    '/invoice',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatusesByInvoice
  );

  // Get statuses by Surat Jalan
  fastify.get(
    '/surat_jalan',
    { preHandler: [fastify.authenticate] },
    StatusController.getStatusesBySuratJalan
  );

  done();
};
