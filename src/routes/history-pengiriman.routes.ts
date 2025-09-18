import { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { HistoryPengirimanController } from '../controllers/history-pengiriman.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  getHistoryPengirimanByStatusCodeSchema,
  getHistoryPengirimanBySuratJalanIdSchema,
  getHistoryPengirimanByTanggalKirimSchema,
  GetHistoryPengirimanBySuratJalanIdInput,
  GetHistoryPengirimanByTanggalKirimInput,
  GetHistoryPengirimanByStatusCodeInput,
} from '../schemas/history-pengiriman.schema';

export const historyPengirimanRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get('/', { preHandler: [fastify.authenticate] }, HistoryPengirimanController.getAll);

  fastify.get<{ Params: GetHistoryPengirimanBySuratJalanIdInput['params'] }>(
    '/surat-jalan/:suratJalanId',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(getHistoryPengirimanBySuratJalanIdSchema),
      ],
    },
    HistoryPengirimanController.getBySuratJalanId
  );

  fastify.get<{ Params: GetHistoryPengirimanByTanggalKirimInput['params'] }>(
    '/tanggal/:tanggalKirim',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(getHistoryPengirimanByTanggalKirimSchema),
      ],
    },
    HistoryPengirimanController.getByTanggalKirim
  );

  fastify.get<{ Params: GetHistoryPengirimanByStatusCodeInput['params'] }>(
    '/status/:statusCode',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(getHistoryPengirimanByStatusCodeSchema),
      ],
    },
    HistoryPengirimanController.getByStatusCode
  );

  done();
};
