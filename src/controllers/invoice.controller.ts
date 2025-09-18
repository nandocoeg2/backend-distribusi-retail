import { FastifyRequest, FastifyReply } from 'fastify';
import { InvoiceService } from '@/services/invoice.service';
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  SearchInvoiceInput,
} from '@/schemas/invoice.schema';
import { paginationSchema } from '@/schemas/pagination.schema';

export class InvoiceController {
  static async createInvoice(
    request: FastifyRequest<{ Body: CreateInvoiceInput }>,
    reply: FastifyReply
  ) {
    // Extract user ID from token for audit trail
    const userId = request.user?.id || 'system';
    
    const invoiceData = {
      ...request.body,
      createdBy: userId,
      updatedBy: userId,
    };

    const invoice = await InvoiceService.createInvoice(invoiceData);
    return reply.code(201).send(invoice);
  }

  static async getInvoices(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await InvoiceService.getAllInvoices(page, limit);
    return reply.send(result);
  }

  static async getInvoice(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const invoice = await InvoiceService.getInvoiceById(request.params.id);
    if (!invoice) {
      return reply.code(404).send({ message: 'Invoice not found' });
    }
    return reply.send(invoice);
  }

  static async updateInvoice(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateInvoiceInput['body'];
    }>,
    reply: FastifyReply
  ) {
    // Extract user ID from token for audit trail
    const userId = request.user?.id || 'system';
    
    const updateData = {
      ...request.body,
      updatedBy: userId,
    };

    const invoice = await InvoiceService.updateInvoice(
      request.params.id,
      updateData,
      userId
    );
    if (!invoice) {
      return reply.code(404).send({ message: 'Invoice not found' });
    }
    return reply.send(invoice);
  }

  static async deleteInvoice(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const invoice = await InvoiceService.deleteInvoice(request.params.id, userId);
    if (!invoice) {
      return reply.code(404).send({ message: 'Invoice not found' });
    }
    return reply.code(204).send();
  }

  static async searchInvoices(
    request: FastifyRequest<{ Querystring: SearchInvoiceInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await InvoiceService.searchInvoices(request.query);
    return reply.send(result);
  }
}
