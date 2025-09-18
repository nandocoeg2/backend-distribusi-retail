import { FastifyRequest, FastifyReply } from 'fastify';
import { SupplierService } from '@/services/supplier.service';
import { CreateSupplierInput, UpdateSupplierInput, SearchSupplierInput, GetAllSuppliersInput } from '@/schemas/supplier.schema';

export class SupplierController {
  static async createSupplier(request: FastifyRequest<{ Body: CreateSupplierInput }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    const supplier = await SupplierService.createSupplier(request.body, userId);
    return reply.code(201).send(supplier);
  }

  static async getSuppliers(request: FastifyRequest<{ Querystring: GetAllSuppliersInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await SupplierService.getAllSuppliers(page, limit);
    return reply.send(result);
  }

  static async getSupplier(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const supplier = await SupplierService.getSupplierById(request.params.id);
    if (!supplier) {
      return reply.code(404).send({ message: 'Supplier not found' });
    }
    return reply.send(supplier);
  }

  static async updateSupplier(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSupplierInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const supplier = await SupplierService.updateSupplier(request.params.id, request.body, userId);
    if (!supplier) {
      return reply.code(404).send({ message: 'Supplier not found' });
    }
    return reply.send(supplier);
  }

  static async deleteSupplier(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id || 'system';
    const supplier = await SupplierService.deleteSupplier(request.params.id, userId);
    if (!supplier) {
      return reply.code(404).send({ message: 'Supplier not found' });
    }
    return reply.code(204).send();
  }

  static async searchSuppliers(request: FastifyRequest<{ Querystring: SearchSupplierInput['query'] }>, reply: FastifyReply) {
    const params = request.params as { q?: string };
    const { page = 1, limit = 10 } = request.query;
    const result = await SupplierService.searchSuppliers(params.q, page, limit);
    return reply.send(result);
  }
}
