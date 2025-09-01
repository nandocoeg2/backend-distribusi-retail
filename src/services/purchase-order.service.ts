import { PurchaseOrder, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  SearchPurchaseOrderInput,
} from '@/schemas/purchase-order.schema';
import { AppError } from '@/utils/app-error';

export class PurchaseOrderService {
  static async createPurchaseOrder(
    data: CreatePurchaseOrderInput
  ): Promise<PurchaseOrder> {
    try {
      return await prisma.purchaseOrder.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('po_number')) {
        throw new AppError('Purchase Order with this PO Number already exists', 409);
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
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        supplier: true,
        purchaseOrderDetails: true,
        files: true,
        status: true,
      },
    });
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
