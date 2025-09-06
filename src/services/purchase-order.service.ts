import { PurchaseOrder, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';
import { AppError } from '@/utils/app-error';

export interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export class PurchaseOrderService {
  static async createPurchaseOrder(
    poData: CreatePurchaseOrderInput,
    fileInfos: FileInfo[]
  ): Promise<PurchaseOrder> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: poData.customerId },
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      const dataForDb = {
        ...poData,
        tanggal_order: new Date(poData.tanggal_order),
        files: {
          create: fileInfos,
        },
      };

      return await prisma.purchaseOrder.create({
        data: dataForDb,
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('po_number')) {
        throw new AppError(
          'Purchase Order with this PO Number already exists',
          409
        );
      }
      throw error;
    }
  }

  static async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return prisma.purchaseOrder.findMany({
      include: {
        customer: true,
        supplier: true,
        files: true,
        status: true,
      },
    });
  }

  static async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        supplier: true,
        purchaseOrderDetails: true,
        files: true,
        status: true,
      },
    });

    if (purchaseOrder && purchaseOrder.po_type === 'BULK' && (!purchaseOrder.files || purchaseOrder.files.length === 0)) {
      throw new AppError('Data integrity violation: BULK purchase order must have at least one file.', 500);
    }

    return purchaseOrder;
  }

  static async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderInput['body']
  ): Promise<PurchaseOrder | null> {
    try {
      return await prisma.purchaseOrder.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  static async deletePurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    try {
      return await prisma.purchaseOrder.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }

  static async searchPurchaseOrders(query: SearchPurchaseOrderInput['query']): Promise<PurchaseOrder[]> {
    const { tanggal_order, customer_name, customerId, suratPO, invoicePengiriman, po_number, supplierId, statusId } = query;

    const filters: Prisma.PurchaseOrderWhereInput[] = [];
    if (tanggal_order) {
      const date = new Date(tanggal_order);
      try {
        filters.push({
          tanggal_order: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          }
        }); 
      } catch (e) {
        // ignore invalid date
      }
    }
    if (customer_name) {
      filters.push({ customer: { name: { contains: customer_name, mode: 'insensitive' } } });
    }
    if (customerId) {
      filters.push({ customerId });
    }
    if (suratPO) {
      filters.push({ suratPO: { contains: suratPO, mode: 'insensitive' } });
    }
    if (invoicePengiriman) {
      filters.push({ invoicePengiriman: { contains: invoicePengiriman, mode: 'insensitive' } });
    }
    if (po_number) {
      filters.push({ po_number: { contains: po_number, mode: 'insensitive' } });
    }
    if (supplierId) {
      filters.push({ supplierId });
    }
    if (statusId) {
      filters.push({ statusId });
    }

    return prisma.purchaseOrder.findMany({
      where: {
        AND: filters.length > 0 ? filters : undefined,
      },
      include: {
        customer: true,
        supplier: true,
        files: true,
        status: true,
      },
    });
  }
}
