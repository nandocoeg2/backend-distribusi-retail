import { FastifyRequest, FastifyReply } from 'fastify';
import { TermOfPaymentService } from '../services/term-of-payment.service';
import { CreateTermOfPaymentInput, UpdateTermOfPaymentInput, SearchTermOfPaymentInput, GetAllTermOfPaymentsInput } from '../schemas/term-of-payment.schema';

export class TermOfPaymentController {
  static async createTermOfPayment(request: FastifyRequest<{ Body: CreateTermOfPaymentInput }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    
    const termOfPayment = await TermOfPaymentService.createTermOfPayment(request.body, userId);
    return reply.code(201).send(termOfPayment);
  }

  static async getTermOfPayments(request: FastifyRequest<{ Querystring: GetAllTermOfPaymentsInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await TermOfPaymentService.getAllTermOfPayments(page, limit);
    return reply.send(result);
  }

  static async getTermOfPayment(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const termOfPayment = await TermOfPaymentService.getTermOfPaymentById(request.params.id);
    if (!termOfPayment) {
      return reply.code(404).send({ message: 'Term of Payment not found' });
    }
    return reply.send(termOfPayment);
  }

  static async updateTermOfPayment(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateTermOfPaymentInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    
    const termOfPayment = await TermOfPaymentService.updateTermOfPayment(request.params.id, request.body, userId);
    if (!termOfPayment) {
      return reply.code(404).send({ message: 'Term of Payment not found' });
    }
    return reply.send(termOfPayment);
  }

  static async deleteTermOfPayment(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    
    const termOfPayment = await TermOfPaymentService.deleteTermOfPayment(request.params.id, userId);
    if (!termOfPayment) {
      return reply.code(404).send({ message: 'Term of Payment not found' });
    }
    return reply.code(204).send();
  }

  static async searchTermOfPayments(request: FastifyRequest<{ Querystring: SearchTermOfPaymentInput['query'] }>, reply: FastifyReply) {
    const params = request.params as { q?: string };
    const { page = 1, limit = 10 } = request.query;
    const result = await TermOfPaymentService.searchTermOfPayments(params.q, page, limit);
    return reply.send(result);
  }
}

