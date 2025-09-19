import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import { CustomerController } from '@/controllers/customer.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createCustomerSchema,
  CreateCustomerInput,
  deleteCustomerSchema,
  getCustomerSchema,
  searchCustomerSchema,
  updateCustomerSchema,
  UpdateCustomerInput,
  GetAllCustomersInput,
  getAllCustomersSchema,
  SearchCustomerInput,
} from '@/schemas/customer.schema';

export const customerRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Querystring: SearchCustomerInput['query'] }>(
    '/search/:q',
    {
      schema: {
        tags: ['Customer'],
        params: z.object({ q: z.string().describe('Search query') }),
        querystring: searchCustomerSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchCustomerSchema)],
    },
    CustomerController.searchCustomers
  );

  fastify.get<{ Querystring: SearchCustomerInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['Customer'],
        querystring: searchCustomerSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchCustomerSchema)],
    },
    CustomerController.searchCustomers
  );

  fastify.post<{ Body: CreateCustomerInput }>(
    '/',
    {
      schema: {
        tags: ['Customer'],
        body: createCustomerSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createCustomerSchema)],
    },
    CustomerController.createCustomer
  );

  fastify.get<{ Querystring: GetAllCustomersInput['query'] }>('/', {
    schema: {
        tags: ['Customer'],
        querystring: getAllCustomersSchema.shape.query,
        security: [{ Bearer: [] }],
      },
    preHandler: [fastify.authenticate, validateRequest(getAllCustomersSchema)]
  }, CustomerController.getCustomers);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Customer'],
        params: getCustomerSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getCustomerSchema)],
    },
    CustomerController.getCustomer
  );

  fastify.put<{ Params: { id: string }; Body: UpdateCustomerInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Customer'],
        params: updateCustomerSchema.shape.params,
        body: updateCustomerSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(updateCustomerSchema)],
    },
    CustomerController.updateCustomer
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Customer'],
        params: deleteCustomerSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(deleteCustomerSchema)],
    },
    CustomerController.deleteCustomer
  );

  done();
};
