import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { LaporanBenerimaanBarangController } from '@/controllers/laporan-benerimaan-barang.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createLaporanBenerimaanBarangSchema,
  CreateLaporanBenerimaanBarangInput,
  deleteLaporanBenerimaanBarangSchema,
  getAllLaporanBenerimaanBarangSchema,
  getLaporanBenerimaanBarangSchema,
  searchLaporanBenerimaanBarangSchema,
  updateLaporanBenerimaanBarangSchema,
  UpdateLaporanBenerimaanBarangInput,
  GetAllLaporanBenerimaanBarangInput,
  SearchLaporanBenerimaanBarangInput,
} from '@/schemas/laporan-benerimaan-barang.schema';

export const laporanBenerimaanBarangRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  _options,
  done
) => {
  fastify.get<{ Querystring: SearchLaporanBenerimaanBarangInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['Laporan Benerimaan Barang'],
        querystring: searchLaporanBenerimaanBarangSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(searchLaporanBenerimaanBarangSchema),
      ],
    },
    LaporanBenerimaanBarangController.search
  );

  fastify.post<{ Body: CreateLaporanBenerimaanBarangInput }>(
    '/',
    {
      schema: {
        tags: ['Laporan Benerimaan Barang'],
        body: createLaporanBenerimaanBarangSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(createLaporanBenerimaanBarangSchema),
      ],
    },
    LaporanBenerimaanBarangController.create
  );

  fastify.get<{ Querystring: GetAllLaporanBenerimaanBarangInput['query'] }>(
    '/',
    {
      schema: {
        tags: ['Laporan Benerimaan Barang'],
        querystring: getAllLaporanBenerimaanBarangSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(getAllLaporanBenerimaanBarangSchema),
      ],
    },
    LaporanBenerimaanBarangController.getAll
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Laporan Benerimaan Barang'],
        params: getLaporanBenerimaanBarangSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(getLaporanBenerimaanBarangSchema),
      ],
    },
    LaporanBenerimaanBarangController.getById
  );

  fastify.put<{ Params: { id: string }; Body: UpdateLaporanBenerimaanBarangInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Laporan Benerimaan Barang'],
        params: updateLaporanBenerimaanBarangSchema.shape.params,
        body: updateLaporanBenerimaanBarangSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(updateLaporanBenerimaanBarangSchema),
      ],
    },
    LaporanBenerimaanBarangController.update
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Laporan Benerimaan Barang'],
        params: deleteLaporanBenerimaanBarangSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(deleteLaporanBenerimaanBarangSchema),
      ],
    },
    LaporanBenerimaanBarangController.delete
  );

  done();
};
