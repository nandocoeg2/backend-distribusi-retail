import { FastifyRequest, FastifyReply } from 'fastify';
import { SuratJalanService } from '@/services/surat-jalan.service';
import {
  CreateSuratJalanInput,
  UpdateSuratJalanInput,
  SearchSuratJalanInput,
  GetSuratJalanByIdInput,
  DeleteSuratJalanInput,
} from '@/schemas/surat-jalan.schema';
import { ResponseUtil } from '@/utils/response.util';

export class SuratJalanController {
  static async createSuratJalan(
    request: FastifyRequest<{ Body: CreateSuratJalanInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const suratJalan = await SuratJalanService.createSuratJalan(request.body, userId);
    return reply.code(201).send(ResponseUtil.success(suratJalan));
  }

  static async getAllSuratJalan(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const query = request.query as any;
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const result = await SuratJalanService.getAllSuratJalan(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async getSuratJalanById(
    request: FastifyRequest<{ Params: GetSuratJalanByIdInput }>,
    reply: FastifyReply
  ) {
    const suratJalan = await SuratJalanService.getSuratJalanById(request.params.id);
    return reply.send(ResponseUtil.success(suratJalan));
  }

  static async updateSuratJalan(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSuratJalanInput['body'] }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const suratJalan = await SuratJalanService.updateSuratJalan(
      request.params.id,
      request.body,
      userId
    );
    return reply.send(ResponseUtil.success(suratJalan));
  }

  static async deleteSuratJalan(
    request: FastifyRequest<{ Params: DeleteSuratJalanInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    await SuratJalanService.deleteSuratJalan(request.params.id, userId);
    return reply.code(204).send();
  }

  static async searchSuratJalan(
    request: FastifyRequest<{ Querystring: SearchSuratJalanInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await SuratJalanService.searchSuratJalan(request.query);
    return reply.send(ResponseUtil.success(result));
  }
}
