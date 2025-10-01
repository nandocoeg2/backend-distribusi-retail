import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { LaporanPenerimaanBarangController } from '@/controllers/laporan-penerimaan-barang.controller';
import { validateRequest } from '@/middleware/validate-request';
import {
  createLaporanPenerimaanBarangSchema,
  CreateLaporanPenerimaanBarangInput,
  deleteLaporanPenerimaanBarangSchema,
  getAllLaporanPenerimaanBarangSchema,
  getLaporanPenerimaanBarangSchema,
  searchLaporanPenerimaanBarangSchema,
  processLaporanPenerimaanBarangSchema,
  updateLaporanPenerimaanBarangSchema,
  getBulkStatusSchema,
  getBulkFilesSchema,
  UpdateLaporanPenerimaanBarangInput,
  GetAllLaporanPenerimaanBarangInput,
  SearchLaporanPenerimaanBarangInput,
  ProcessLaporanPenerimaanBarangInput,
  GetBulkStatusInput,
  GetBulkFilesInput,
} from '@/schemas/laporan-penerimaan-barang.schema';

export const laporanPenerimaanBarangRoutes: FastifyPluginCallback<FastifyPluginOptions> = (
  fastify,
  _options,
  done
) => {
  fastify.get<{ Querystring: SearchLaporanPenerimaanBarangInput['query'] }>(
    '/search',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        querystring: searchLaporanPenerimaanBarangSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(searchLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.search
  );

  fastify.post<{ Body: CreateLaporanPenerimaanBarangInput }>(
    '/',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        body: createLaporanPenerimaanBarangSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(createLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.create
  );

  fastify.get<{ Querystring: GetAllLaporanPenerimaanBarangInput['query'] }>(
    '/',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        querystring: getAllLaporanPenerimaanBarangSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(getAllLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.getAll
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        params: getLaporanPenerimaanBarangSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(getLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.getById
  );

  fastify.put<{ Params: { id: string }; Body: UpdateLaporanPenerimaanBarangInput['body'] }>(
    '/:id',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        params: updateLaporanPenerimaanBarangSchema.shape.params,
        body: updateLaporanPenerimaanBarangSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(updateLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.update
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        params: deleteLaporanPenerimaanBarangSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(deleteLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.delete
  );

  fastify.patch<{ Body: ProcessLaporanPenerimaanBarangInput['body'] }>(
    '/process',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        body: processLaporanPenerimaanBarangSchema.shape.body,
        security: [{ Bearer: [] }],
        description: 'Process goods receipt reports by providing array of IDs in body',
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(processLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.process
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id/process',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        params: getLaporanPenerimaanBarangSchema.shape.params,
        security: [{ Bearer: [] }],
        description: 'Process a single goods receipt report by ID',
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(getLaporanPenerimaanBarangSchema),
      ],
    },
    LaporanPenerimaanBarangController.processSingle
  );

  fastify.post(
    '/upload',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        security: [{ Bearer: [] }],
        consumes: ['multipart/form-data'],
      },
      preHandler: [
        fastify.authenticate,
      ],
    },
    LaporanPenerimaanBarangController.uploadFile
  );

  fastify.post(
    '/bulk',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        security: [{ Bearer: [] }],
        consumes: ['multipart/form-data'],
      },
      preHandler: [
        fastify.authenticate,
      ],
    },
    LaporanPenerimaanBarangController.uploadBulkFiles
  );

  fastify.post(
    '/upload-bulk',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        security: [{ Bearer: [] }],
        consumes: ['multipart/form-data'],
      },
      preHandler: [
        fastify.authenticate,
      ],
    },
    LaporanPenerimaanBarangController.uploadBulkFiles
  );

  fastify.get<{ Params: GetBulkStatusInput['params'] }>(
    '/bulk-status/:bulkId',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        security: [{ Bearer: [] }],
        params: getBulkStatusSchema.shape.params,
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(getBulkStatusSchema),
      ],
    },
    LaporanPenerimaanBarangController.getBulkProcessingStatus
  );

  fastify.get<{ Querystring: GetBulkFilesInput['query'] }>(
    '/bulk-files',
    {
      schema: {
        tags: ['Laporan Penerimaan Barang'],
        security: [{ Bearer: [] }],
        querystring: getBulkFilesSchema.shape.query,
      },
      preHandler: [
        fastify.authenticate,
        validateRequest(getBulkFilesSchema),
      ],
    },
    LaporanPenerimaanBarangController.getAllBulkFiles
  );

  done();
};

