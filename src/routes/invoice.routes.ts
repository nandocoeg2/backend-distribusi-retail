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
      schema: {
        tags: ['Invoice'],
        querystring: searchInvoiceSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchInvoiceSchema)],
    },
    InvoiceController.searchInvoices
  );

  fastify.post<{ Body: CreateInvoiceInput }>(
    '/',
    {
      schema: {
        tags: ['Invoice'],
        body: createInvoiceSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createInvoiceSchema)],
    },
    InvoiceController.createInvoice
  );

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Invoice'],
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    InvoiceController.getInvoices
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Invoice'],
        params: getInvoiceSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getInvoiceSchema)],
    },
    InvoiceController.getInvoice
  );

  fastify.put<{ Params: { id: string }; Body: UpdateInvoiceInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Invoice'],
        params: updateInvoiceSchema.shape.params,
        body: updateInvoiceSchema.shape.body,
        security: [{ Bearer: [] }],
      },
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
      schema: {
        tags: ['Invoice'],
        params: deleteInvoiceSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(deleteInvoiceSchema),
      ],
    },
    InvoiceController.deleteInvoice
  );

  done();
};
