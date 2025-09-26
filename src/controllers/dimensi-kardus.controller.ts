import { FastifyRequest, FastifyReply } from 'fastify';
import { DimensiKardusService } from '@/services/dimensi-kardus.service';
import {
  CreateDimensiKardusInput,
  UpdateDimensiKardusInput,
  GetAllDimensiKardusInput,
  SearchDimensiKardusInput,
  GetDimensiKardusInput,
} from '@/schemas/dimensi-kardus.schema';
import { ResponseUtil } from '@/utils/response.util';

export class DimensiKardusController {
  static async create(
    request: FastifyRequest<{ Body: CreateDimensiKardusInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const created = await DimensiKardusService.create(request.body, userId);
    return reply.status(201).send(ResponseUtil.success(created));
  }

  static async getAll(
    request: FastifyRequest<{ Querystring: GetAllDimensiKardusInput['query'] }>,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10 } = request.query || {} as any;
    const result = await DimensiKardusService.getAll(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async search(
    request: FastifyRequest<{ Querystring: SearchDimensiKardusInput['query'] }>,
    reply: FastifyReply
  ) {
    const { q, page = 1, limit = 10 } = request.query as any;
    const result = await DimensiKardusService.search(q, page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getById(
    request: FastifyRequest<{ Params: GetDimensiKardusInput['params'] }>,
    reply: FastifyReply
  ) {
    const { id } = request.params as any;
    const data = await DimensiKardusService.getById(id);
    return reply.send(ResponseUtil.success(data));
  }

  static async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateDimensiKardusInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const { id } = request.params as any;
    const updated = await DimensiKardusService.update(id, request.body, userId);
    return reply.send(ResponseUtil.success(updated));
  }

  static async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const { id } = request.params as any;
    const deleted = await DimensiKardusService.delete(id, userId);
    return reply.send(ResponseUtil.success(deleted));
  }
}


