import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusService } from '@/services/status.service';
import { ResponseUtil } from '@/utils/response.util';

export class StatusController {
  static async getStatuses(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getAllStatuses();
    return reply.send(ResponseUtil.success(statuses));
  }

  static async getStatusesByCategory(
    request: FastifyRequest<{ Params: { category: string } }>, 
    reply: FastifyReply
  ) {
    const { category } = request.params;
    const statuses = await StatusService.getStatusesByCategory(category);
    return reply.send(ResponseUtil.success(statuses));
  }

  static async getAllCategories(request: FastifyRequest, reply: FastifyReply) {
    const categories = await StatusService.getAllCategories();
    return reply.send(ResponseUtil.success(categories));
  }

  static async getStatusesByPurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByPurchaseOrder();
    return reply.send(ResponseUtil.success(statuses));
  }

  static async getStatusesByBulkFile(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByBulkFile();
    return reply.send(ResponseUtil.success(statuses));
  }

  static async getStatusesByPacking(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByPacking();
    return reply.send(ResponseUtil.success(statuses));
  }

  static async getStatusesByPackingItem(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByPackingItem();
    return reply.send(ResponseUtil.success(statuses));
  }

  static async getStatusesByInvoice(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesByInvoice();
    return reply.send(ResponseUtil.success(statuses));
  }

  static async getStatusesBySuratJalan(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getStatusesBySuratJalan();
    return reply.send(ResponseUtil.success(statuses));
  }
}
