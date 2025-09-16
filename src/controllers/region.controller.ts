import { FastifyRequest, FastifyReply } from 'fastify';
import { RegionService } from '../services/region.service';
import { CreateRegionInput, UpdateRegionInput, SearchRegionInput, GetAllRegionsInput } from '../schemas/region.schema';

export class RegionController {
  static async createRegion(request: FastifyRequest<{ Body: CreateRegionInput }>, reply: FastifyReply) {
    // Extract user ID from token for audit trail
    const userId = request.user?.id || 'system';
    
    const region = await RegionService.createRegion(request.body, userId);
    return reply.code(201).send(region);
  }

  static async getRegions(request: FastifyRequest<{ Querystring: GetAllRegionsInput['query'] }>, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query;
    const result = await RegionService.getAllRegions(page, limit);
    return reply.send(result);
  }

  static async getRegion(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const region = await RegionService.getRegionById(request.params.id);
    if (!region) {
      return reply.code(404).send({ message: 'Region not found' });
    }
    return reply.send(region);
  }

  static async updateRegion(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateRegionInput['body'] }>,
    reply: FastifyReply
  ) {
    // Extract user ID from token for audit trail
    const userId = request.user?.id || 'system';
    
    const region = await RegionService.updateRegion(request.params.id, request.body, userId);
    if (!region) {
      return reply.code(404).send({ message: 'Region not found' });
    }
    return reply.send(region);
  }

  static async deleteRegion(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    // Extract user ID from token for audit trail
    const userId = request.user?.id || 'system';
    
    const region = await RegionService.deleteRegion(request.params.id, userId);
    if (!region) {
      return reply.code(404).send({ message: 'Region not found' });
    }
    return reply.code(204).send();
  }

  static async searchRegions(request: FastifyRequest<{ Querystring: SearchRegionInput['query'] }>, reply: FastifyReply) {
    const params = request.params as { q?: string };
    const { page = 1, limit = 10 } = request.query;
    const result = await RegionService.searchRegions(params.q, page, limit);
    return reply.send(result);
  }
}
