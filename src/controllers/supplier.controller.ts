import { FastifyRequest, FastifyReply } from 'fastify';
import { SupplierService } from '@/services/supplier.service';
import { CreateSupplierInput, UpdateSupplierInput } from '@/schemas/supplier.schema';

export class SupplierController {
  static async createSupplier(request: FastifyRequest<{ Body: CreateSupplierInput }>, reply: FastifyReply) {
    const supplier = await SupplierService.createSupplier(request.body);
    return reply.code(201).send(supplier);
  }

  static async getSuppliers(request: FastifyRequest, reply: FastifyReply) {
    const suppliers = await SupplierService.getAllSuppliers();
    return reply.send(suppliers);
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
    const supplier = await SupplierService.updateSupplier(request.params.id, request.body);
    if (!supplier) {
      return reply.code(404).send({ message: 'Supplier not found' });
    }
    return reply.send(supplier);
  }

  static async deleteSupplier(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const supplier = await SupplierService.deleteSupplier(request.params.id);
    if (!supplier) {
      return reply.code(404).send({ message: 'Supplier not found' });
    }
    return reply.code(204).send();
  }
}

