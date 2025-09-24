import { FastifyRequest, FastifyReply } from 'fastify';
import { InvoicePenagihanService } from '@/services/invoice-penagihan.service';
import {
  CreateInvoicePenagihanInput,
  UpdateInvoicePenagihanInput,
  SearchInvoicePenagihanInput,
} from '@/schemas/invoice-penagihan.schema';
import { ResponseUtil } from '@/utils/response.util';

export class InvoicePenagihanController {
  static async createInvoice(
    request: FastifyRequest<{ Body: CreateInvoicePenagihanInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const invoice = await InvoicePenagihanService.createInvoice(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(invoice));
  }

  static async getInvoices(request: FastifyRequest, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await InvoicePenagihanService.getAllInvoices(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getInvoice(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const invoice = await InvoicePenagihanService.getInvoiceById(request.params.id);
    return reply.send(ResponseUtil.success(invoice));
  }

  static async updateInvoice(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateInvoicePenagihanInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const invoice = await InvoicePenagihanService.updateInvoice(
      request.params.id,
      request.body,
      userId
    );
    return reply.send(ResponseUtil.success(invoice));
  }

  static async deleteInvoice(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    await InvoicePenagihanService.deleteInvoice(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchInvoices(
    request: FastifyRequest<{ Querystring: SearchInvoicePenagihanInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await InvoicePenagihanService.searchInvoices(request.query);
    return reply.send(ResponseUtil.success(result));
  }
}
