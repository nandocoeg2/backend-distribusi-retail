import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusService } from '@/services/status.service';

export class StatusController {
  static async getStatuses(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getAllStatuses();
    return reply.send(statuses);
  }

  static async getStatusesByPurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByPurchaseOrder();
    return reply.send(statuses);
  }

  static async getStatusesByBulkFile(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByBulkFile();
    return reply.send(statuses);
  }

  static async getStatusesByPacking(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByPacking();
    return reply.send(statuses);
  }

  static async getStatusesByPackingItem(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByPackingItem();
    return reply.send(statuses);
  }

  static async getStatusesByInvoice(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByInvoice();
    return reply.send(statuses);
  }

  static async getStatusesBySuratJalan(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesBySuratJalan();
    return reply.send(statuses);
  }
}

