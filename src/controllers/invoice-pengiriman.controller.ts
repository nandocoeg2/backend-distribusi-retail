import { FastifyRequest, FastifyReply } from 'fastify';
import { InvoicePengirimanService } from '@/services/invoice-pengiriman.service';
import {
  CreateInvoicePengirimanInput,
  UpdateInvoicePengirimanInput,
  SearchInvoicePengirimanInput,
} from '@/schemas/invoice-pengiriman.schema';
import { ResponseUtil } from '@/utils/response.util';

export class InvoicePengirimanController {
  static async createInvoice(
    request: FastifyRequest<{ Body: CreateInvoicePengirimanInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const invoice = await InvoicePengirimanService.createInvoice(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(invoice));
  }

  static async getInvoices(request: FastifyRequest, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await InvoicePengirimanService.getAllInvoices(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getInvoice(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const invoice = await InvoicePengirimanService.getInvoiceById(request.params.id);
    return reply.send(ResponseUtil.success(invoice));
  }

  static async updateInvoice(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateInvoicePengirimanInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const invoice = await InvoicePengirimanService.updateInvoice(
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
    await InvoicePengirimanService.deleteInvoice(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchInvoices(
    request: FastifyRequest<{ Querystring: SearchInvoicePengirimanInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await InvoicePengirimanService.searchInvoices(request.query);
    return reply.send(ResponseUtil.success(result));
  }

  static async createPenagihan(
    request: FastifyRequest<{
      Params: { id: string };
      Body?: { statusId?: string };
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const { id } = request.params;
    const { statusId } = request.body || {};

    const invoicePenagihan = await InvoicePengirimanService.createPenagihan(
      id,
      statusId,
      userId
    );

    return reply.code(201).send(ResponseUtil.success(invoicePenagihan));
  }
}


