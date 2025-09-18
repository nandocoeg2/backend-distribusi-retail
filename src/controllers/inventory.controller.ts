import { FastifyRequest, FastifyReply } from 'fastify';
import { InventoryService } from '@/services/inventory.service';
import { 
  CreateInventoryInput, 
  UpdateInventoryInput, 
  GetAllInventoriesInput, 
  SearchInventoryInput
} from '@/schemas/inventory.schema';
import { AppError } from '@/utils/app-error';

export class InventoryController {
  static async create(
    request: FastifyRequest<{ Body: CreateInventoryInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';

      const inventory = await InventoryService.create(request.body, userId);
      return reply.status(201).send(inventory);
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError('Error creating inventory', 500);
    }
  }

  static async getAll(
    request: FastifyRequest<{ Querystring: GetAllInventoriesInput['query'] }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10 } = request.query;
      const inventories = await InventoryService.getAll(page, limit);
      return reply.status(200).send(inventories);
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError('Error fetching inventories', 500);
    }
  }

  static async search(
    request: FastifyRequest<{ Querystring: SearchInventoryInput['query'] }>,
    reply: FastifyReply
  ) {
    try {
      const { q, page = 1, limit = 10 } = request.query;
      const inventories = await InventoryService.search(q, page, limit);
      return reply.status(200).send(inventories);
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError('Error searching inventories', 500);
    }
  }

  static async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const inventory = await InventoryService.getById(request.params.id);
      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }
      return reply.status(200).send(inventory);
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError('Error fetching inventory', 500);
    }
  }

  static async update(
    request: FastifyRequest<{ Body: UpdateInventoryInput['body']; Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';

      const inventory = await InventoryService.update(request.params.id, request.body, userId);

      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }

      return reply.status(200).send(inventory);
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError('Error updating inventory', 500);
    }
  }

  static async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';

      const deletedInventory = await InventoryService.delete(request.params.id, userId);

      if (!deletedInventory) {
        throw new AppError('Inventory not found', 404);
      }

      return reply.status(204).send();
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError('Error deleting inventory', 500);
    }
  }
}
