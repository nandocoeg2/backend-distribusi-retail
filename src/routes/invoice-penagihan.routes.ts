import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { InvoicePenagihanController } from '@/controllers/invoice-penagihan.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createInvoicePenagihanSchema,
  CreateInvoicePenagihanInput,
  deleteInvoicePenagihanSchema,
  getInvoicePenagihanSchema,
  updateInvoicePenagihanSchema,
  UpdateInvoicePenagihanInput,
  SearchInvoicePenagihanInput,
  searchInvoicePenagihanSchema,
} from '@/schemas/invoice-penagihan.schema';

export const invoicePenagihanRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) => {
  fastify.get<{ Querystring: SearchInvoicePenagihanInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['InvoicePenagihan'],
        querystring: searchInvoicePenagihanSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchInvoicePenagihanSchema)],
    },
    InvoicePenagihanController.searchInvoices
  );

  fastify.post<{ Body: CreateInvoicePenagihanInput }>(
    '/',
    {
      schema: {
        tags: ['InvoicePenagihan'],
        body: createInvoicePenagihanSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createInvoicePenagihanSchema)],
    },
    InvoicePenagihanController.createInvoice
  );

  fastify.get(
    '/',
    {
      schema: {
        tags: ['InvoicePenagihan'],
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    InvoicePenagihanController.getInvoices
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['InvoicePenagihan'],
        params: getInvoicePenagihanSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getInvoicePenagihanSchema)],
    },
    InvoicePenagihanController.getInvoice
  );

  fastify.put<{ Params: { id: string }; Body: UpdateInvoicePenagihanInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['InvoicePenagihan'],
        params: updateInvoicePenagihanSchema.shape.params,
        body: updateInvoicePenagihanSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(updateInvoicePenagihanSchema)],
    },
    InvoicePenagihanController.updateInvoice
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['InvoicePenagihan'],
        params: deleteInvoicePenagihanSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(deleteInvoicePenagihanSchema)],
    },
    InvoicePenagihanController.deleteInvoice
  );

  done();
};
