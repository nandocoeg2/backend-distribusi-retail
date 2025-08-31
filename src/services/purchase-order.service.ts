import { PurchaseOrder } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from '@/schemas/purchase-order.schema';

export class PurchaseOrderService {
  static async createPurchaseOrder(
    data: CreatePurchaseOrderInput
  ): Promise<PurchaseOrder> {
    return prisma.purchaseOrder.create({
      data,
    });
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
}
