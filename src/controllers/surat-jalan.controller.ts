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
      // Extract user ID from token for audit trail
      const userId = request.user?.id || 'system';
      
      const suratJalanData = {
        ...request.body,
        createdBy: userId,
        updatedBy: userId,
      };
      
      const suratJalan = await SuratJalanService.createSuratJalan(suratJalanData);
      
      reply.code(201).send({
        success: true,
        data: suratJalan,
        message: 'Surat jalan created successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
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

      reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Surat jalan retrieved successfully',
      });
    } catch (error) {
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

      return reply.send({
        success: true,
        data: suratJalan,
        message: 'Surat jalan retrieved successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve surat jalan', 500);
    }
  }

  static async updateSuratJalan(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSuratJalanInput['body'] }>,
    reply: FastifyReply
  ) {
    try {
      // Extract user ID from token for audit trail
      const userId = request.user?.id || 'system';
      
      const updateData = {
        ...request.body,
        updatedBy: userId,
      };
      
      const suratJalan = await SuratJalanService.updateSuratJalan(
        request.params.id,
        updateData
      );

      if (!suratJalan) {
        return reply.code(404).send({ message: 'Surat jalan not found' });
      }

      return reply.send({
        success: true,
        data: suratJalan,
        message: 'Surat jalan updated successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update surat jalan', 500);
    }
  }

  static async deleteSuratJalan(
    request: FastifyRequest<{ Params: DeleteSuratJalanInput }>,
    reply: FastifyReply
  ) {
    try {
      const suratJalan = await SuratJalanService.deleteSuratJalan(request.params.id);

      if (!suratJalan) {
        return reply.code(404).send({ message: 'Surat jalan not found' });
      }

      return reply.send({
        success: true,
        data: suratJalan,
        message: 'Surat jalan deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete surat jalan', 500);
    }
  }

  static async searchSuratJalan(
    request: FastifyRequest<{ Querystring: SearchSuratJalanInput['query'] }>,
    reply: FastifyReply
  ) {
    try {
      const result = await SuratJalanService.searchSuratJalan(request.query);

      reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Surat jalan search completed successfully',
      });
    } catch (error) {
      throw new AppError('Failed to search surat jalan', 500);
    }
  }
}
