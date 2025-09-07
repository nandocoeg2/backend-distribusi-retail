import { FastifyInstance } from 'fastify';
import {
  getAllHistoryPengirimanHandler,
  getHistoryPengirimanByStatusCodeHandler,
  getHistoryPengirimanBySuratJalanIdHandler,
  getHistoryPengirimanByTanggalKirimHandler,
} from '../controllers/history-pengiriman.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  getHistoryPengirimanByStatusCodeSchema,
  getHistoryPengirimanBySuratJalanIdSchema,
  getHistoryPengirimanByTanggalKirimSchema,
  GetHistoryPengirimanBySuratJalanIdInput,
  GetHistoryPengirimanByTanggalKirimInput,
  GetHistoryPengirimanByStatusCodeInput,
} from '../schemas/history-pengiriman.schema';

const historyPengirimanRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', { preHandler: [fastify.authenticate] }, getAllHistoryPengirimanHandler);

  fastify.get<{ Params: GetHistoryPengirimanBySuratJalanIdInput['params'] }>(
    '/surat-jalan/:suratJalanId',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(getHistoryPengirimanBySuratJalanIdSchema),
      ],
    },
    getHistoryPengirimanBySuratJalanIdHandler
  );

  fastify.get<{ Params: GetHistoryPengirimanByTanggalKirimInput['params'] }>(
    '/tanggal/:tanggalKirim',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(getHistoryPengirimanByTanggalKirimSchema),
      ],
    },
    getHistoryPengirimanByTanggalKirimHandler
  );

  fastify.get<{ Params: GetHistoryPengirimanByStatusCodeInput['params'] }>(
    '/status/:statusCode',
    {
      preHandler: [
        fastify.authenticate,
        validateRequest(getHistoryPengirimanByStatusCodeSchema),
      ],
    },
    getHistoryPengirimanByStatusCodeHandler
  );
};

export default historyPengirimanRoutes;

