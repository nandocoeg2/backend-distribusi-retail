import { FastifyRequest, FastifyReply } from 'fastify';
import { PackingService } from '@/services/packing.service';
import {
  CreatePackingInput,
  UpdatePackingInput,
  SearchPackingInput,
} from '@/schemas/packing.schema';
import { AppError } from '@/utils/app-error';

export class PackingController {
  static async createPacking(
    request: FastifyRequest<{ Body: CreatePackingInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';
      const packing = await PackingService.createPacking(request.body, userId);
      return reply.code(201).send(packing);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating packing', 500);
    }
  }

  static async getPackings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
      const result = await PackingService.getAllPackings(page, limit);
      return reply.send(result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching packings', 500);
    }
  }

  static async getPacking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const packing = await PackingService.getPackingById(request.params.id);
      if (!packing) {
        return reply.code(404).send({ message: 'Packing not found' });
      }
      return reply.send(packing);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching packing', 500);
    }
  }

  static async updatePacking(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdatePackingInput['body'];
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';
      const packing = await PackingService.updatePacking(
        request.params.id,
        request.body,
        userId
      );
      if (!packing) {
        return reply.code(404).send({ message: 'Packing not found' });
      }
      return reply.send(packing);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating packing', 500);
    }
  }

  static async deletePacking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';
      const packing = await PackingService.deletePacking(request.params.id, userId);
      if (!packing) {
        return reply.code(404).send({ message: 'Packing not found' });
      }
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error deleting packing', 500);
    }
  }

  static async searchPackings(
    request: FastifyRequest<{ Querystring: SearchPackingInput['query'] }>,
    reply: FastifyReply
  ) {
    try {
      const result = await PackingService.searchPackings(request.query);
      return reply.send(result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error searching packings', 500);
    }
  }
}
