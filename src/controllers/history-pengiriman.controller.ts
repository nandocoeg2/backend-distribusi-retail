import { FastifyReply, FastifyRequest } from 'fastify';
import { HistoryPengirimanService } from '../services/history-pengiriman.service';
import {
  GetHistoryPengirimanByStatusCodeInput,
  GetHistoryPengirimanBySuratJalanIdInput,
  GetHistoryPengirimanByTanggalKirimInput,
} from '../schemas/history-pengiriman.schema';
import { ResponseUtil } from '@/utils/response.util';

export class HistoryPengirimanController {
  static async getAll(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const historyPengiriman = await HistoryPengirimanService.getAll();
    return reply.send(ResponseUtil.success(historyPengiriman));
  }

  static async getBySuratJalanId(
    request: FastifyRequest<{ Params: GetHistoryPengirimanBySuratJalanIdInput['params'] }>,
    reply: FastifyReply
  ) {
    const { suratJalanId } = request.params;
    const historyPengiriman = await HistoryPengirimanService.getBySuratJalanId(
      suratJalanId
    );
    return reply.send(ResponseUtil.success(historyPengiriman));
  }

  static async getByTanggalKirim(
    request: FastifyRequest<{ Params: GetHistoryPengirimanByTanggalKirimInput['params'] }>,
    reply: FastifyReply
  ) {
    const { tanggalKirim } = request.params;
    const historyPengiriman = await HistoryPengirimanService.getByTanggalKirim(
      new Date(tanggalKirim)
    );
    return reply.send(ResponseUtil.success(historyPengiriman));
  }

  static async getByStatusCode(
    request: FastifyRequest<{ Params: GetHistoryPengirimanByStatusCodeInput['params'] }>,
    reply: FastifyReply
  ) {
    const { statusCode } = request.params;
    const historyPengiriman = await HistoryPengirimanService.getByStatusCode(statusCode);
    return reply.send(ResponseUtil.success(historyPengiriman));
  }
}
