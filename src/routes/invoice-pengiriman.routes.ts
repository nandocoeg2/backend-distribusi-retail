import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { InvoicePengirimanController } from '@/controllers/invoice-pengiriman.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createInvoicePengirimanSchema,
  CreateInvoicePengirimanInput,
  deleteInvoicePengirimanSchema,
  getInvoicePengirimanSchema,
  updateInvoicePengirimanSchema,
  UpdateInvoicePengirimanInput,
  SearchInvoicePengirimanInput,
  searchInvoicePengirimanSchema,
  createPenagihanFromPengirimanSchema,
  CreatePenagihanFromPengirimanInput,
} from '@/schemas/invoice-pengiriman.schema';

export const invoicePengirimanRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) => {
  fastify.get<{ Querystring: SearchInvoicePengirimanInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['InvoicePengiriman'],
        querystring: searchInvoicePengirimanSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchInvoicePengirimanSchema)],
    },
    InvoicePengirimanController.searchInvoices
  );

  fastify.post<{ Body: CreateInvoicePengirimanInput }>(
    '/',
    {
      schema: {
        tags: ['InvoicePengiriman'],
        body: createInvoicePengirimanSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createInvoicePengirimanSchema)],
    },
    InvoicePengirimanController.createInvoice
  );

  fastify.get(
    '/',
    {
      schema: {
        tags: ['InvoicePengiriman'],
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    InvoicePengirimanController.getInvoices
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['InvoicePengiriman'],
        params: getInvoicePengirimanSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getInvoicePengirimanSchema)],
    },
    InvoicePengirimanController.getInvoice
  );

  fastify.put<{ Params: { id: string }; Body: UpdateInvoicePengirimanInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['InvoicePengiriman'],
        params: updateInvoicePengirimanSchema.shape.params,
        body: updateInvoicePengirimanSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(updateInvoicePengirimanSchema)],
    },
    InvoicePengirimanController.updateInvoice
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['InvoicePengiriman'],
        params: deleteInvoicePengirimanSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(deleteInvoicePengirimanSchema)],
    },
    InvoicePengirimanController.deleteInvoice
  );

  fastify.post<CreatePenagihanFromPengirimanInput>(
    '/:id/create-penagihan',
    {
      schema: {
        tags: ['InvoicePengiriman'],
        description: 'Create InvoicePenagihan from existing InvoicePengiriman',
        params: createPenagihanFromPengirimanSchema.shape.params,
        body: createPenagihanFromPengirimanSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createPenagihanFromPengirimanSchema)],
    },
    InvoicePengirimanController.createPenagihan
  );

  done();
};


