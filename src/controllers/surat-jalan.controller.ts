import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '@/utils/app-error';
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
    try {
      const userId = request.user?.id || 'system';
      const suratJalan = await SuratJalanService.createSuratJalan(request.body, userId);
      return reply.code(201).send(ResponseUtil.success(suratJalan));
    } catch (error: any) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(ResponseUtil.error(error.message));
      }
      return reply.code(500).send(ResponseUtil.error('Failed to create surat jalan'));
    }
  }

  static async getAllSuratJalan(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const query = request.query as any;
      // Handle case where page might be an object or invalid value
      const pageValue = query.page;
      const page = typeof pageValue === 'string' ? parseInt(pageValue) || 1 : 1;
      
      // Handle case where limit might be an object or invalid value
      const limitValue = query.limit;
      const limit = typeof limitValue === 'string' ? parseInt(limitValue) || 10 : 10;
      
      const result = await SuratJalanService.getAllSuratJalan(page, limit);
      return reply.send(ResponseUtil.success(result));
    } catch (error: any) {
      return reply.code(500).send(ResponseUtil.error('Failed to get surat jalan'));
    }
  }

  static async getSuratJalanById(
    request: FastifyRequest<{ Params: GetSuratJalanByIdInput }>,
    reply: FastifyReply
  ) {
    try {
      const suratJalan = await SuratJalanService.getSuratJalanById(request.params.id);
      return reply.send(ResponseUtil.success(suratJalan));
    } catch (error: any) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(ResponseUtil.error(error.message));
      }
      return reply.code(500).send(ResponseUtil.error('Failed to get surat jalan'));
    }
  }

  static async updateSuratJalan(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSuratJalanInput['body'] }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';
      const suratJalan = await SuratJalanService.updateSuratJalan(
        request.params.id,
        request.body,
        userId
      );
      return reply.send(ResponseUtil.success(suratJalan));
    } catch (error: any) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(ResponseUtil.error(error.message));
      }
      return reply.code(500).send(ResponseUtil.error('Failed to update surat jalan'));
    }
  }

  static async deleteSuratJalan(
    request: FastifyRequest<{ Params: DeleteSuratJalanInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';
      await SuratJalanService.deleteSuratJalan(request.params.id, userId);
      return reply.code(204).send();
    } catch (error: any) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(ResponseUtil.error(error.message));
      }
      return reply.code(500).send(ResponseUtil.error('Failed to delete surat jalan'));
    }
  }

  static async searchSuratJalan(
    request: FastifyRequest<{ Querystring: SearchSuratJalanInput['query'] }>,
    reply: FastifyReply
  ) {
    try {
      const result = await SuratJalanService.searchSuratJalan(request.query);
      return reply.send(ResponseUtil.success(result));
    } catch (error: any) {
      return reply.code(500).send(ResponseUtil.error('Failed to search surat jalan'));
    }
  }
}
