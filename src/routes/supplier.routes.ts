import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { SupplierController } from '@/controllers/supplier.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createSupplierSchema,
  CreateSupplierInput,
  deleteSupplierSchema,
  getSupplierSchema,
  updateSupplierSchema,
  UpdateSupplierInput,
  searchSupplierSchema,
  GetAllSuppliersInput,
  getAllSuppliersSchema,
} from '@/schemas/supplier.schema';

export const supplierRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Params: { q: string }; Querystring: GetAllSuppliersInput['query'] }>(
    '/search/:q',
    {
      preHandler: [fastify.authenticate, validateRequest(searchSupplierSchema)],
    },
    SupplierController.searchSuppliers
  );

  fastify.get<{ Querystring: GetAllSuppliersInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(getAllSuppliersSchema)],
    },
    SupplierController.searchSuppliers
  );

  fastify.post<{ Body: CreateSupplierInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createSupplierSchema)],
    },
    SupplierController.createSupplier
  );

  fastify.get<{ Querystring: GetAllSuppliersInput['query'] }>('/', { 
    preHandler: [fastify.authenticate, validateRequest(getAllSuppliersSchema)] 
  }, SupplierController.getSuppliers);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getSupplierSchema)],
    },
    SupplierController.getSupplier
  );

  fastify.put<{ Params: { id: string }; Body: UpdateSupplierInput['body'] }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(updateSupplierSchema)],
    },
    SupplierController.updateSupplier
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(deleteSupplierSchema)],
    },
    SupplierController.deleteSupplier
  );

  done();
};
