import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseUtil } from '@/utils/response.util';
import { LaporanBenerimaanBarangService } from '@/services/laporan-benerimaan-barang.service';
import {
  CreateLaporanBenerimaanBarangInput,
  GetAllLaporanBenerimaanBarangInput,
  SearchLaporanBenerimaanBarangInput,
  UpdateLaporanBenerimaanBarangInput,
} from '@/schemas/laporan-benerimaan-barang.schema';

export class LaporanBenerimaanBarangController {
  static async create(
    request: FastifyRequest<{ Body: CreateLaporanBenerimaanBarangInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const result = await LaporanBenerimaanBarangService.createLaporanBenerimaanBarang(
      request.body,
      userId
    );
    return reply.code(201).send(ResponseUtil.success(result));
  }

  static async getAll(
    request: FastifyRequest<{ Querystring: GetAllLaporanBenerimaanBarangInput['query'] }>,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10 } = request.query;
    const result = await LaporanBenerimaanBarangService.getAllLaporanBenerimaanBarang(
      page,
      limit
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const result = await LaporanBenerimaanBarangService.getLaporanBenerimaanBarangById(
      request.params.id
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateLaporanBenerimaanBarangInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const result = await LaporanBenerimaanBarangService.updateLaporanBenerimaanBarang(
      request.params.id,
      request.body,
      userId
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    await LaporanBenerimaanBarangService.deleteLaporanBenerimaanBarang(
      request.params.id,
      userId
    );
    return reply.code(204).send();
  }

  static async search(
    request: FastifyRequest<{ Querystring: SearchLaporanBenerimaanBarangInput['query'] }>,
    reply: FastifyReply
  ) {
    const { q, page = 1, limit = 10 } = request.query;
    const result = await LaporanBenerimaanBarangService.searchLaporanBenerimaanBarang(
      q,
      page,
      limit
    );
    return reply.send(ResponseUtil.success(result));
  }
}
