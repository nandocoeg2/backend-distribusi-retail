import { FastifyRequest, FastifyReply } from 'fastify';
import { InvoiceService } from '@/services/invoice.service';
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  SearchInvoiceInput,
} from '@/schemas/invoice.schema';
import { ResponseUtil } from '@/utils/response.util';

export class InvoiceController {
  static async createInvoice(
    request: FastifyRequest<{ Body: CreateInvoiceInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const invoice = await InvoiceService.createInvoice(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(invoice));
  }

  static async getInvoices(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await InvoiceService.getAllInvoices(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getInvoice(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const invoice = await InvoiceService.getInvoiceById(request.params.id);
    return reply.send(ResponseUtil.success(invoice));
  }

  static async updateInvoice(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateInvoiceInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const invoice = await InvoiceService.updateInvoice(
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
    await InvoiceService.deleteInvoice(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchInvoices(
    request: FastifyRequest<{ Querystring: SearchInvoiceInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await InvoiceService.searchInvoices(request.query);
    return reply.send(ResponseUtil.success(result));
  }
}
