import { FastifyRequest, FastifyReply } from 'fastify';
import { InventoryService } from '@/services/inventory.service';
import { 
  CreateInventoryInput, 
  UpdateInventoryInput, 
  GetAllInventoriesInput, 
  SearchInventoryInput
} from '@/schemas/inventory.schema';
import { ResponseUtil } from '@/utils/response.util';

export class InventoryController {
  static async create(
    request: FastifyRequest<{ Body: CreateInventoryInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const inventory = await InventoryService.create(request.body, userId);
    return reply.status(201).send(ResponseUtil.success(inventory));
  }

  static async getAll(
    request: FastifyRequest<{ Querystring: GetAllInventoriesInput['query'] }>,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10 } = request.query;
    const inventories = await InventoryService.getAll(Number(page), Number(limit));
    return reply.send(ResponseUtil.success(inventories));
  }

  static async search(
    request: FastifyRequest<{ Querystring: SearchInventoryInput['query'] }>,
    reply: FastifyReply
  ) {
    const { q, page = 1, limit = 10 } = request.query;
    const inventories = await InventoryService.search(q, Number(page), Number(limit));
    return reply.send(ResponseUtil.success(inventories));
  }

  static async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const inventory = await InventoryService.getById(request.params.id);
    return reply.send(ResponseUtil.success(inventory));
  }

  static async update(
    request: FastifyRequest<{ Body: UpdateInventoryInput['body']; Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const inventory = await InventoryService.update(request.params.id, request.body, userId);
    return reply.send(ResponseUtil.success(inventory));
  }

  static async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    await InventoryService.delete(request.params.id, userId);
    return reply.status(204).send();
  }
}
