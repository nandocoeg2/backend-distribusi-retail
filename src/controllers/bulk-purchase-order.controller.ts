import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '@/utils/app-error';
import { generateFilenameWithPrefix } from '@/utils/random.utils';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { prisma } from '@/config/database';
import { BulkPurchaseOrderRefactoredService } from '@/services/bulk-purchase-order-refactored.service';
import { generateBulkPoId } from '@/utils/bulk-id.utils';
import { FileUploaded, Prisma } from '@prisma/client';
import { ResponseUtil } from '@/utils/response.util';

const pump = promisify(pipeline);

export class BulkPurchaseOrderController {
  static async bulkCreatePurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
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
    const bulkId = generateBulkPoId();

    try {
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          const today = new Date().toISOString().split('T')[0]!;
          const uploadDir = path.join(process.cwd(), 'fileuploaded', 'purchase-order', 'bulk', today);
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const filename = generateFilenameWithPrefix('PO_BULK', part.filename);
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
      const result = await BulkPurchaseOrderRefactoredService.uploadBulkFilesAndProcess(
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
      
      throw error;
    }
  }

  static async getUploadStatus(
    request: FastifyRequest<{ Params: { bulkId: string } }>,
    reply: FastifyReply
  ) {
    const { bulkId } = request.params;
    const fileStatus = await BulkPurchaseOrderRefactoredService.getBulkProcessingStatus(bulkId);
    return reply.send(ResponseUtil.success(fileStatus));
  }

  static async getAllBulkFiles(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { status } = request.query as { status?: string };
    const files = await BulkPurchaseOrderRefactoredService.getAllBulkFiles(status);
    return reply.send(ResponseUtil.success(files));
  }
}

