import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
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
} from '@/schemas/customer.schema';

export const customerRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get(
    '/search/:q',
    {
      preHandler: [fastify.authenticate, validateRequest(searchCustomerSchema)],
    },
    CustomerController.searchCustomers
  );

  fastify.get(
    '/search',
    {
      preHandler: [fastify.authenticate],
    },
    CustomerController.searchCustomers
  );

  fastify.post<{ Body: CreateCustomerInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createCustomerSchema)],
    },
    CustomerController.createCustomer
  );

  fastify.get('/', { preHandler: [fastify.authenticate] }, CustomerController.getCustomers);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getCustomerSchema)],
    },
    CustomerController.getCustomer
  );

  fastify.put<{ Params: { id: string }; Body: UpdateCustomerInput['body'] }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(updateCustomerSchema)],
    },
    CustomerController.updateCustomer
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(deleteCustomerSchema)],
    },
    CustomerController.deleteCustomer
  );

  done();
};

