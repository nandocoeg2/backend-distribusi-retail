import { FastifyRequest, FastifyReply } from 'fastify';
import { PurchaseOrderService, FileInfo } from '@/services/purchase-order.service';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
  HistoryPurchaseOrderInput,
  ProcessPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';
import { AppError } from '@/utils/app-error';
import { generateFilenameWithPrefix } from '@/utils/random.utils';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { ResponseUtil } from '@/utils/response.util';

const pump = promisify(pipeline);

export class PurchaseOrderController {
  static async createPurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
    if (!request.isMultipart()) {
      throw new AppError('Request is not multipart', 400);
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

          const filename = generateFilenameWithPrefix('PO', part.filename);
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

      // Parse purchase order details if provided
      let purchaseOrderDetails = undefined;
      if (fields.purchaseOrderDetails) {
        try {
          purchaseOrderDetails = JSON.parse(fields.purchaseOrderDetails);
        } catch (error) {
          throw new AppError('Invalid purchaseOrderDetails JSON format', 400);
        }
      }

      const poData: CreatePurchaseOrderInput = {
        customerId: fields.customerId,
        po_number: fields.po_number,
        total_items: parseInt(fields.total_items, 10),  
        tanggal_masuk_po: fields.tanggal_masuk_po,
        tanggal_batas_kirim: fields.tanggal_batas_kirim,
        termin_bayar: fields.termin_bayar,
        po_type: fields.po_type as 'BULK' | 'SINGLE',
        status_code: fields.status_code,
        purchaseOrderDetails,
      };

      const purchaseOrder = await PurchaseOrderService.createPurchaseOrder(
        poData,
        fileInfos,
        request.user?.id || 'system'
      );
      return reply.code(201).send(ResponseUtil.success(purchaseOrder));
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
    return reply.send(ResponseUtil.success(result));
  }

  static async getPurchaseOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const purchaseOrder = await PurchaseOrderService.getPurchaseOrderById(
      request.params.id
    );
    return reply.send(ResponseUtil.success(purchaseOrder));
  }

  static async updatePurchaseOrder(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdatePurchaseOrderInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    const purchaseOrder = await PurchaseOrderService.updatePurchaseOrder(
      request.params.id,
      request.body,
      userId
    );
    return reply.send(ResponseUtil.success(purchaseOrder));
  }

  static async deletePurchaseOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await PurchaseOrderService.deletePurchaseOrder(
      request.params.id,
      request.user?.id || 'system'
    );
    return reply.code(204).send();
  }

  static async searchPurchaseOrders(
    request: FastifyRequest<{ Querystring: SearchPurchaseOrderInput['query'] }>,
    reply: FastifyReply
  ) {
    const result = await PurchaseOrderService.searchPurchaseOrders(
      request.query
    );
    return reply.send(ResponseUtil.success(result));
  }

  static async getHistoryPurchaseOrders(
    request: FastifyRequest<{ Querystring: HistoryPurchaseOrderInput }>,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
    const result = await PurchaseOrderService.getHistoryPurchaseOrders(page, limit);
    return reply.send(ResponseUtil.success(result));
  }

  static async processPurchaseOrder(
    request: FastifyRequest<{
      Body: ProcessPurchaseOrderInput['body'];
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id || 'system';
    
    const result = await PurchaseOrderService.processPurchaseOrder(
      request.body.ids,
      request.body.status_code,
      userId
    );
    return reply.send(ResponseUtil.success(result));
  }
}
