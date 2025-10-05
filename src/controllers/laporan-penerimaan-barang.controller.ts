import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseUtil } from '@/utils/response.util';
import { LaporanPenerimaanBarangService } from '@/services/laporan-penerimaan-barang.service';
import logger from '@/config/logger';
import {
  CreateLaporanPenerimaanBarangInput,
  GetAllLaporanPenerimaanBarangInput,
  SearchLaporanPenerimaanBarangInput,
  UpdateLaporanPenerimaanBarangInput,
  ProcessLaporanPenerimaanBarangInput,
  CompleteLaporanPenerimaanBarangInput,
} from '@/schemas/laporan-penerimaan-barang.schema';
import { generateFilenameWithPrefix } from '@/utils/random.utils';
import { generateBulkLpbId } from '@/utils/bulk-id.utils';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

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
    const result = await LaporanPenerimaanBarangService.searchLaporanPenerimaanBarang(
      request.query
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async process(
    request: FastifyRequest<{
      Body: ProcessLaporanPenerimaanBarangInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';

    const result = await LaporanPenerimaanBarangService.processLaporanPenerimaanBarang(
      request.body.ids,
      userId
    );

    return reply.send(ResponseUtil.success(result));
  }

  static async processSingle(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';

    const result = await LaporanPenerimaanBarangService.processLaporanPenerimaanBarang(
      [request.params.id],
      userId
    );

    return reply.send(ResponseUtil.success(result));
  }

  static async complete(
    request: FastifyRequest<{
      Body: CompleteLaporanPenerimaanBarangInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';

    const result = await LaporanPenerimaanBarangService.completeLaporanPenerimaanBarang(
      request.body.ids,
      userId
    );

    return reply.send(ResponseUtil.success(result));
  }

  static async completeSingle(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';

    const result = await LaporanPenerimaanBarangService.completeLaporanPenerimaanBarang(
      [request.params.id],
      userId
    );

    return reply.send(ResponseUtil.success(result));
  }

  static async uploadFile(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';

    // Ambil file dari request
    const data = await request.file();
    
    if (!data) {
      return reply.code(400).send(ResponseUtil.error('No file uploaded'));
    }

    const buffer = await data.toBuffer();
    let mimeType = data.mimetype;
    
    if (mimeType === 'multipart/form-data') {
      const filename = data.filename || '';
      if (filename.toLowerCase().endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else {
        mimeType = 'application/octet-stream';
      }
    }
    
    // Ambil prompt dari form data jika ada
    const prompt = data.fields?.prompt as string | undefined;
    
    // Log untuk debugging
    logger.info('File upload details', {
      filename: data.filename,
      originalMimeType: data.mimetype,
      correctedMimeType: mimeType,
      size: buffer.length,
      prompt: prompt
    });

    const result = await LaporanPenerimaanBarangService.uploadFileAndConvert(
      buffer,
      mimeType,
      data.filename || 'unknown',
      prompt,
      userId
    );

    return reply.code(201).send(ResponseUtil.success({
      message: 'File uploaded and converted successfully',
      lpbData: result.lpbData,
    }));
  }

  static async uploadBulkFiles(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    if (!request.isMultipart()) {
      return reply.code(400).send(ResponseUtil.error('Request is not multipart'));
    }

    if (!request.user) {
      return reply.code(401).send(ResponseUtil.error('User not authenticated'));
    }

    const userId = request.user.id;
    const createdFiles: any[] = [];
    const tempFilepaths: string[] = [];
    let prompt: string | undefined;

    // Generate bulk ID untuk tracking
    const bulkId = generateBulkLpbId();

    try {
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          const today = new Date().toISOString().split('T')[0]!;
          const uploadDir = path.join(process.cwd(), 'fileuploaded', 'laporan-penerimaan-barang', 'bulk', today);
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const filename = generateFilenameWithPrefix('LPB_BULK', part.filename);
          const filepath = path.join(uploadDir, `${bulkId}_${filename}`);
          tempFilepaths.push(filepath);

          await pump(part.file, fs.createWriteStream(filepath));

          const stats = await fs.promises.stat(filepath);

          const fileData = {
            filename: part.filename,
            path: filepath,
            mimetype: part.mimetype,
            size: stats.size,
            createdBy: userId,
          };

          createdFiles.push(fileData);
        } else if (part.type === 'field' && part.fieldname === 'prompt') {
          prompt = part.value as string;
        }
      }

      if (createdFiles.length === 0) {
        return reply.code(400).send(ResponseUtil.error('At least one file is required for bulk upload'));
      }

      // Proses file di background
      const result = await LaporanPenerimaanBarangService.uploadBulkFilesAndProcess(
        createdFiles,
        prompt,
        userId
      );

      return reply.code(201).send(ResponseUtil.success({
        message: result.message,
        bulkId: result.bulkId,
        totalFiles: result.totalFiles,
      }));
    } catch (error) {
      // Cleanup temp files
      if (tempFilepaths.length > 0) {
        for (const filepath of tempFilepaths) {
          await fs.promises.unlink(filepath).catch(console.error);
        }
      }
      
      logger.error('Error in bulk file upload', { error });
      return reply.code(500).send(ResponseUtil.error('Failed to process bulk upload'));
    }
  }

  static async getBulkProcessingStatus(
    request: FastifyRequest<{ Params: { bulkId: string } }>,
    reply: FastifyReply
  ) {
    const result = await LaporanPenerimaanBarangService.getBulkProcessingStatus(
      request.params.bulkId
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async getAllBulkFiles(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { status } = request.query as { status?: string };
    const files = await LaporanPenerimaanBarangService.getAllBulkFiles(status);
    return reply.send(ResponseUtil.success(files));
  }
}

