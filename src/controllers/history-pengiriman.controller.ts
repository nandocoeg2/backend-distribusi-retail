import { FastifyReply, FastifyRequest } from 'fastify';
import {
  getAllHistoryPengiriman,
  getHistoryPengirimanBySuratJalanId,
  getHistoryPengirimanByTanggalKirim,
  getHistoryPengirimanByStatusCode,
} from '../services/history-pengiriman.service';
import {
  GetHistoryPengirimanByStatusCodeInput,
  GetHistoryPengirimanBySuratJalanIdInput,
  GetHistoryPengirimanByTanggalKirimInput,
} from '../schemas/history-pengiriman.schema';

export const getAllHistoryPengirimanHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const historyPengiriman = await getAllHistoryPengiriman();
  return reply.send(historyPengiriman);
};

export const getHistoryPengirimanBySuratJalanIdHandler = async (
  request: FastifyRequest<{ Params: GetHistoryPengirimanBySuratJalanIdInput['params'] }>,
  reply: FastifyReply
) => {
  const { suratJalanId } = request.params;
  const historyPengiriman = await getHistoryPengirimanBySuratJalanId(
    suratJalanId
  );
  return reply.send(historyPengiriman);
};

export const getHistoryPengirimanByTanggalKirimHandler = async (
  request: FastifyRequest<{ Params: GetHistoryPengirimanByTanggalKirimInput['params'] }>,
  reply: FastifyReply
) => {
  const { tanggalKirim } = request.params;
  const historyPengiriman = await getHistoryPengirimanByTanggalKirim(
    new Date(tanggalKirim)
  );
  return reply.send(historyPengiriman);
};

export const getHistoryPengirimanByStatusCodeHandler = async (
  request: FastifyRequest<{ Params: GetHistoryPengirimanByStatusCodeInput['params'] }>,
  reply: FastifyReply
) => {
  const { statusCode } = request.params;
  const historyPengiriman = await getHistoryPengirimanByStatusCode(statusCode);
  return reply.send(historyPengiriman);
};

