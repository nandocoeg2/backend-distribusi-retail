import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { TermOfPaymentController } from '../controllers/term-of-payment.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  createTermOfPaymentSchema,
  CreateTermOfPaymentInput,
  deleteTermOfPaymentSchema,
  getTermOfPaymentSchema,
  searchTermOfPaymentSchema,
  updateTermOfPaymentSchema,
  UpdateTermOfPaymentInput,
  GetAllTermOfPaymentsInput,
  getAllTermOfPaymentsSchema,
} from '../schemas/term-of-payment.schema';

export const termOfPaymentRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Params: { q: string }; Querystring: GetAllTermOfPaymentsInput['query'] }>(
    '/search/:q',
    {
      preHandler: [fastify.authenticate, validateRequest(searchTermOfPaymentSchema)],
    },
    TermOfPaymentController.searchTermOfPayments
  );

  fastify.get<{ Querystring: GetAllTermOfPaymentsInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(getAllTermOfPaymentsSchema)],
    },
    TermOfPaymentController.searchTermOfPayments
  );

  fastify.post<{ Body: CreateTermOfPaymentInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createTermOfPaymentSchema)],
    },
    TermOfPaymentController.createTermOfPayment
  );

  fastify.get<{ Querystring: GetAllTermOfPaymentsInput['query'] }>('/', { 
    preHandler: [fastify.authenticate, validateRequest(getAllTermOfPaymentsSchema)] 
  }, TermOfPaymentController.getTermOfPayments);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getTermOfPaymentSchema)],
    },
    TermOfPaymentController.getTermOfPayment
  );

  fastify.put<{ Params: { id: string }; Body: UpdateTermOfPaymentInput['body'] }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(updateTermOfPaymentSchema)],
    },
    TermOfPaymentController.updateTermOfPayment
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(deleteTermOfPaymentSchema)],
    },
    TermOfPaymentController.deleteTermOfPayment
  );

  done();
};

