import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseUtil } from '@/utils/response.util';
import { LaporanPenerimaanBarangService } from '@/services/laporan-penerimaan-barang.service';
import {
  CreateLaporanPenerimaanBarangInput,
  GetAllLaporanPenerimaanBarangInput,
  SearchLaporanPenerimaanBarangInput,
  UpdateLaporanPenerimaanBarangInput,
} from '@/schemas/laporan-penerimaan-barang.schema';

export class LaporanPenerimaanBarangController {
  static async create(
    request: FastifyRequest<{ Body: CreateLaporanPenerimaanBarangInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const result = await LaporanPenerimaanBarangService.createLaporanPenerimaanBarang(
      request.body,
      userId
    );
    return reply.code(201).send(ResponseUtil.success(result));
  }

  static async getAll(
    request: FastifyRequest<{ Querystring: GetAllLaporanPenerimaanBarangInput['query'] }>,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10 } = request.query;
    const result = await LaporanPenerimaanBarangService.getAllLaporanPenerimaanBarang(
      page,
      limit
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const result = await LaporanPenerimaanBarangService.getLaporanPenerimaanBarangById(
      request.params.id
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateLaporanPenerimaanBarangInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const result = await LaporanPenerimaanBarangService.updateLaporanPenerimaanBarang(
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
    await LaporanPenerimaanBarangService.deleteLaporanPenerimaanBarang(
      request.params.id,
      userId
    );
    return reply.code(204).send();
  }

  static async search(
    request: FastifyRequest<{ Querystring: SearchLaporanPenerimaanBarangInput['query'] }>,
    reply: FastifyReply
  ) {
    const { q, page = 1, limit = 10 } = request.query;
    const result = await LaporanPenerimaanBarangService.searchLaporanPenerimaanBarang(
      q,
      page,
      limit
    );
    return reply.send(ResponseUtil.success(result));
  }
}
