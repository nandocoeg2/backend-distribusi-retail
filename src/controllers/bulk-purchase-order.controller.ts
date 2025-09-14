import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '@/utils/app-error';
import { generateFilenameWithPrefix } from '@/utils/random.utils';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { prisma } from '@/config/database';
import { BulkPurchaseOrderService } from '@/services/bulk-purchase-order.service';
import { FileUploaded } from '@prisma/client';

const pump = promisify(pipeline);

export class BulkPurchaseOrderController {
  static async bulkCreatePurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
    if (!request.isMultipart()) {
      return reply.code(400).send(new AppError('Request is not multipart', 400));
    }

    const createdFiles: FileUploaded[] = [];
    const tempFilepaths: string[] = [];

    const pendingStatus = await prisma.status.findUnique({
      where: { status_code: 'PENDING BULK FILE' },
    });

    if (!pendingStatus) {
      throw new AppError('Pending status not found in database.', 500);
    }

    try {
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          const today = new Date().toISOString().split('T')[0]!;
          const uploadDir = path.join(process.cwd(), 'fileuploaded', 'bulk', today);
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const filename = generateFilenameWithPrefix('BULK_PO', part.filename);
          const filepath = path.join(uploadDir, filename);
          tempFilepaths.push(filepath);

          await pump(part.file, fs.createWriteStream(filepath));

          const stats = await fs.promises.stat(filepath);

          const createdFile = await prisma.fileUploaded.create({
            data: {
              filename: part.filename,
              path: filepath,
              mimetype: part.mimetype,
              size: stats.size,
              status: {
                connect: { id: pendingStatus.id },
              },
            },
          });
          createdFiles.push(createdFile);
        }
      }

      if (createdFiles.length === 0) {
        throw new AppError('At least one file is required for bulk upload', 400);
      }

      return reply.code(201).send({
        message: `${createdFiles.length} files uploaded successfully and are pending processing.`,
        files: createdFiles,
      });
    } catch (error) {
      if (tempFilepaths.length > 0) {
        for (const path of tempFilepaths) {
          await fs.promises.unlink(path).catch(console.error);
        }
      }
      if (createdFiles.length > 0) {
        const idsToDelete = createdFiles.map((f) => f.id);
        await prisma.fileUploaded.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }
      throw error;
    }
  }

  static async getUploadStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const fileStatus = await BulkPurchaseOrderService.getBulkUploadStatus(id);
    return reply.send(fileStatus);
  }

  static async getAllBulkFiles(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { status } = request.query as { status?: string };
    const files = await BulkPurchaseOrderService.getAllBulkFiles(status);
    return reply.send(files);
  }
}
