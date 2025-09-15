import { FastifyRequest, FastifyReply } from 'fastify';
import { PackingService } from '@/services/packing.service';
import {
  CreatePackingInput,
  UpdatePackingInput,
  SearchPackingInput,
} from '@/schemas/packing.schema';
import { AppError } from '@/utils/app-error';

export class PackingController {
  static async createPacking(request: FastifyRequest, reply: FastifyReply) {
    try {
      const packingData: CreatePackingInput = request.body as CreatePackingInput;
      // Add updatedBy from authenticated user (extract user ID from token)
      const userId = request.user?.id || 'system';
      
      const packingDataWithUser = {
        ...packingData,
        updatedBy: userId,
      };
      
      const packing = await PackingService.createPacking(packingDataWithUser);
      return reply.code(201).send(packing);
    } catch (error) {
      throw error;
    }
  }

  static async getPackings(request: FastifyRequest, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await PackingService.getAllPackings(page, limit);
    return reply.send(result);
  }

  static async getPacking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const packing = await PackingService.getPackingById(request.params.id);
    if (!packing) {
      return reply.code(404).send({ message: 'Packing not found' });
    }
    return reply.send(packing);
  }

  static async updatePacking(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdatePackingInput['body'];
    }>,
    reply: FastifyReply
  ) {
    try {
      // Add updatedBy from authenticated user (extract user ID from token)
      const userId = request.user?.id || 'system';
      
      const updateData = {
        ...request.body,
        updatedBy: userId,
      };
      
      const packing = await PackingService.updatePacking(
        request.params.id,
        updateData
      );
      if (!packing) {
        return reply.code(404).send({ message: 'Packing not found' });
      }
      return reply.send(packing);
    } catch (error) {
      throw error;
    }
  }

  static async deletePacking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const packing = await PackingService.deletePacking(request.params.id);
    if (!packing) {
      return reply.code(404).send({ message: 'Packing not found' });
    }
    return reply.code(204).send();
  }

  static async searchPackings(
    request: FastifyRequest<{ Querystring: SearchPackingInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await PackingService.searchPackings(request.query);
    return reply.send(result);
  }
}
