import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { GroupCustomerController } from '../controllers/group-customer.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  createGroupCustomerSchema,
  CreateGroupCustomerInput,
  deleteGroupCustomerSchema,
  getGroupCustomerSchema,
  searchGroupCustomerSchema,
  updateGroupCustomerSchema,
  UpdateGroupCustomerInput,
  GetAllGroupCustomersInput,
  getAllGroupCustomersSchema,
} from '../schemas/group-customer.schema';

export const groupCustomerRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Params: { q: string }; Querystring: GetAllGroupCustomersInput['query'] }>(
    '/search/:q',
    {
      preHandler: [fastify.authenticate, validateRequest(searchGroupCustomerSchema)],
    },
    GroupCustomerController.searchGroupCustomers
  );

  fastify.get<{ Querystring: GetAllGroupCustomersInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(getAllGroupCustomersSchema)],
    },
    GroupCustomerController.searchGroupCustomers
  );

  fastify.post<{ Body: CreateGroupCustomerInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createGroupCustomerSchema)],
    },
    GroupCustomerController.createGroupCustomer
  );

  fastify.get<{ Querystring: GetAllGroupCustomersInput['query'] }>('/', { 
    preHandler: [fastify.authenticate, validateRequest(getAllGroupCustomersSchema)] 
  }, GroupCustomerController.getGroupCustomers);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getGroupCustomerSchema)],
    },
    GroupCustomerController.getGroupCustomer
  );

  fastify.put<{ Params: { id: string }; Body: UpdateGroupCustomerInput['body'] }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(updateGroupCustomerSchema)],
    },
    GroupCustomerController.updateGroupCustomer
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(deleteGroupCustomerSchema)],
    },
    GroupCustomerController.deleteGroupCustomer
  );

  done();
};

