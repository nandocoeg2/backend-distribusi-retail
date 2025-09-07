import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { InvoiceController } from '@/controllers/invoice.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createInvoiceSchema,
  CreateInvoiceInput,
  deleteInvoiceSchema,
  getInvoiceSchema,
  updateInvoiceSchema,
  UpdateInvoiceInput,
  SearchInvoiceInput,
  searchInvoiceSchema,
} from '@/schemas/invoice.schema';

export const invoiceRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  options,
  done
) => {
  fastify.get<{ Querystring: SearchInvoiceInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(searchInvoiceSchema)],
    },
    InvoiceController.searchInvoices
  );

  fastify.post<{ Body: CreateInvoiceInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createInvoiceSchema)],
    },
    InvoiceController.createInvoice
  );

  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    InvoiceController.getInvoices
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getInvoiceSchema)],
    },
    InvoiceController.getInvoice
  );

  fastify.put<{ Params: { id: string }; Body: UpdateInvoiceInput['body'] }>(
    '/:id',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(updateInvoiceSchema),
      ],
    },
    InvoiceController.updateInvoice
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(deleteInvoiceSchema),
      ],
    },
    InvoiceController.deleteInvoice
  );

  done();
};
