import { FastifyRequest, FastifyReply } from 'fastify';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from '@/schemas/purchase-order.schema';

export class PurchaseOrderController {
  static async createPurchaseOrder(
    request: FastifyRequest<{ Body: CreatePurchaseOrderInput }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.createPurchaseOrder(
      request.body
    );
    return reply.code(201).send(purchaseOrder);
  }

  static async getPurchaseOrders(request: FastifyRequest, reply: FastifyReply) {
    const purchaseOrders = await PurchaseOrderService.getAllPurchaseOrders();
    return reply.send(purchaseOrders);
  }

  static async getPurchaseOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.getPurchaseOrderById(
      request.params.id
    );
    if (!purchaseOrder) {
      return reply.code(404).send({ message: 'Purchase Order not found' });
    }
    return reply.send(purchaseOrder);
  }

  static async updatePurchaseOrder(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdatePurchaseOrderInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.updatePurchaseOrder(
      request.params.id,
      request.body
    );
    if (!purchaseOrder) {
      return reply.code(404).send({ message: 'Purchase Order not found' });
    }
    return reply.send(purchaseOrder);
  }

  static async deletePurchaseOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.deletePurchaseOrder(
      request.params.id
    );
    if (!purchaseOrder) {
      return reply.code(404).send({ message: 'Purchase Order not found' });
    }
    return reply.code(204).send();
  }
}
