import { FastifyRequest, FastifyReply } from 'fastify';
import { PurchaseOrderService, FileInfo } from '@/services/purchase-order.service';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';
import { AppError } from '@/utils/app-error';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { MultipartFile } from '@fastify/multipart';

const pump = promisify(pipeline);

export class PurchaseOrderController {
  static async createPurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
    if (!request.isMultipart()) {
      return reply.code(400).send(new AppError('Request is not multipart', 400));
    }

    const fields: { [key: string]: any } = {};
    const fileInfos: FileInfo[] = [];
    const tempFilepaths: string[] = [];

    try {
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          const today = new Date().toISOString().split('T')[0]!;
          const uploadDir = path.join(process.cwd(), 'fileuploaded', today);
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const randomString = randomBytes(2).toString('hex');
          const filename = `PO_${part.filename.split('.')[0]}_${randomString}.${part.filename.split('.').pop()}`;
          const filepath = path.join(uploadDir, filename);
          tempFilepaths.push(filepath);

          await pump(part.file, fs.createWriteStream(filepath));

          const stats = await fs.promises.stat(filepath);
          fileInfos.push({
            filename: part.filename,
            path: filepath,
            mimetype: part.mimetype,
            size: stats.size,
          });
        } else {
          fields[part.fieldname] = part.value;
        }
      }

      const poData: CreatePurchaseOrderInput = {
        customerId: fields.customerId,
        po_number: fields.po_number,
        total_items: parseInt(fields.total_items, 10),  
        tanggal_order: fields.tanggal_order,
        po_type: fields.po_type as 'BULK' | 'SINGLE',
        statusId: fields.statusId,
        suratJalan: fields.suratJalan,
        invoicePengiriman: fields.invoicePengiriman,
        suratPO: fields.suratPO,
        suratPenagihan: fields.suratPenagihan,
      };

      const purchaseOrder = await PurchaseOrderService.createPurchaseOrder(
        poData,
        fileInfos
      );
      return reply.code(201).send(purchaseOrder);
    } catch (error) {
      if (tempFilepaths.length > 0) {
        for (const path of tempFilepaths) {
          await fs.promises.unlink(path).catch(console.error);
        }
      }
      throw error;
    }
  }

  static async getPurchaseOrders(request: FastifyRequest, reply: FastifyReply) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await PurchaseOrderService.getAllPurchaseOrders(page, limit);
    return reply.send(result);
  }

  static async getPurchaseOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.getPurchaseOrderById(
      request.params.id
    );
    if (!purchaseOrder) {
      return reply.code(404).send({ message: 'Purchase Order not found' });
    }
    return reply.send(purchaseOrder);
  }

  static async updatePurchaseOrder(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdatePurchaseOrderInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.updatePurchaseOrder(
      request.params.id,
      request.body
    );
    if (!purchaseOrder) {
      return reply.code(404).send({ message: 'Purchase Order not found' });
    }
    return reply.send(purchaseOrder);
  }

  static async deletePurchaseOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.deletePurchaseOrder(
      request.params.id
    );
    if (!purchaseOrder) {
      return reply.code(404).send({ message: 'Purchase Order not found' });
    }
    return reply.code(204).send();
  }

  static async searchPurchaseOrders(
    request: FastifyRequest<{ Querystring: SearchPurchaseOrderInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await PurchaseOrderService.searchPurchaseOrders(
      request.query
    );
    return reply.send(result);
  }
}
