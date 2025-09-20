import { FastifyRequest, FastifyReply } from 'fastify';
import { PackingService } from '@/services/packing.service';
import {
  CreatePackingInput,
  UpdatePackingInput,
  SearchPackingInput,
  ProcessPackingInput,
} from '@/schemas/packing.schema';
import { ResponseUtil } from '@/utils/response.util';

export class PackingController {
  static async createPacking(
    request: FastifyRequest<{ Body: CreatePackingInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const packing = await PackingService.createPacking(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(packing));
  }

  static async getPackings(request: FastifyRequest, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await PackingService.getAllPackings(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getPacking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const packing = await PackingService.getPackingById(request.params.id);
    return reply.send(ResponseUtil.success(packing));
  }

  static async updatePacking(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdatePackingInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const packing = await PackingService.updatePacking(
      request.params.id,
      request.body,
      userId
    );
    return reply.send(ResponseUtil.success(packing));
  }

  static async deletePacking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    await PackingService.deletePacking(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchPackings(
    request: FastifyRequest<{ Querystring: SearchPackingInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await PackingService.searchPackings(request.query);
    return reply.send(ResponseUtil.success(result));
  }

  static async processPacking(
    request: FastifyRequest<{ Body: ProcessPackingInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const result = await PackingService.processPacking(request.body.ids, userId);
    return reply.send(ResponseUtil.success(result));
  }
}
