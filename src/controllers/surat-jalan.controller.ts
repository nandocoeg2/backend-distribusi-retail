import { FastifyRequest, FastifyReply } from 'fastify';
import { SuratJalanService } from '@/services/surat-jalan.service';
import {
  CreateSuratJalanInput,
  UpdateSuratJalanInput,
  SearchSuratJalanInput,
  GetSuratJalanByIdInput,
  DeleteSuratJalanInput,
} from '@/schemas/surat-jalan.schema';
import { AppError } from '@/utils/app-error';

export class SuratJalanController {
  static async createSuratJalan(
    request: FastifyRequest<{ Body: CreateSuratJalanInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';
      const suratJalan = await SuratJalanService.createSuratJalan(request.body, userId);
      return reply.code(201).send(suratJalan);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create surat jalan', 500);
    }
  }

  static async getAllSuratJalan(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const query = request.query as any;
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      const result = await SuratJalanService.getAllSuratJalan(page, limit);
      return reply.send(result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to retrieve surat jalan', 500);
    }
  }

  static async getSuratJalanById(
    request: FastifyRequest<{ Params: GetSuratJalanByIdInput }>,
    reply: FastifyReply
  ) {
    try {
      const suratJalan = await SuratJalanService.getSuratJalanById(request.params.id);
      if (!suratJalan) {
        return reply.code(404).send({ message: 'Surat jalan not found' });
      }
      return reply.send(suratJalan);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to retrieve surat jalan', 500);
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
      if (!suratJalan) {
        return reply.code(404).send({ message: 'Surat jalan not found' });
      }
      return reply.send(suratJalan);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update surat jalan', 500);
    }
  }

  static async deleteSuratJalan(
    request: FastifyRequest<{ Params: DeleteSuratJalanInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id || 'system';
      const suratJalan = await SuratJalanService.deleteSuratJalan(request.params.id, userId);
      if (!suratJalan) {
        return reply.code(404).send({ message: 'Surat jalan not found' });
      }
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete surat jalan', 500);
    }
  }

  static async searchSuratJalan(
    request: FastifyRequest<{ Querystring: SearchSuratJalanInput['query'] }>,
    reply: FastifyReply
  ) {
    try {
      const result = await SuratJalanService.searchSuratJalan(request.query);
      return reply.send(result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to search surat jalan', 500);
    }
  }
}
