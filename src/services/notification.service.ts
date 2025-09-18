import { Notification, NotificationType, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import logger from '@/config/logger';

interface CreateNotificationInput {
  title: string;
  message: string;
  type?: NotificationType;
  inventoryId?: string;
  isRead?: boolean;
}

interface UpdateNotificationInput {
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
}

interface StockAlertResult {
  lowStock: Notification[];
  outOfStock: Notification[];
}

export class NotificationService {
  static async createNotification(data: CreateNotificationInput): Promise<Notification> {
    return prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'GENERAL',
        inventoryId: data.inventoryId,
        isRead: data.isRead ?? false,
      },
    });
  }

  static async getAllNotifications(): Promise<Notification[]> {
    return prisma.notification.findMany({
      include: { inventory: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  static async getNotificationById(id: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: { inventory: true },
    });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return notification;
  }

  static async getUnreadNotifications(): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { isRead: false },
      include: { inventory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getNotificationsByType(type: NotificationType): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { type },
      include: { inventory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateNotification(id: string, data: UpdateNotificationInput): Promise<Notification> {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return prisma.notification.update({
      where: { id },
      data,
      include: { inventory: true },
    });
  }

  static async deleteNotification(id: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return prisma.notification.delete({
      where: { id },
      include: { inventory: true },
    });
  }

  static async markAsRead(id: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
      include: { inventory: true },
    });
  }

  static async markAllAsRead(): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  static async checkLowStockAlerts(): Promise<Notification[]> {
    const inventories = await prisma.inventory.findMany({
      where: { stok_barang: { lte: prisma.inventory.fields.min_stok } }
    });

    const notifications: Notification[] = [];
    for (const inventory of inventories) {
      const existing = await prisma.notification.findFirst({
        where: { inventoryId: inventory.id, type: 'LOW_STOCK', isRead: false },
      });
      if (!existing) {
        notifications.push(await this.createNotification({
          title: `Low Stock Alert: ${inventory.nama_barang}`,
          message: `Stock for ${inventory.nama_barang} is running low. Current stock: ${inventory.stok_barang}, Minimum stock: ${inventory.min_stok}`,
          type: 'LOW_STOCK',
          inventoryId: inventory.id,
        }));
      }
    }
    return notifications;
  }

  static async checkOutOfStockAlerts(): Promise<Notification[]> {
    const inventories = await prisma.inventory.findMany({ where: { stok_barang: 0 } });
    const notifications: Notification[] = [];
    for (const inventory of inventories) {
      const existing = await prisma.notification.findFirst({
        where: { inventoryId: inventory.id, type: 'OUT_OF_STOCK', isRead: false },
      });
      if (!existing) {
        notifications.push(await this.createNotification({
          title: `Out of Stock: ${inventory.nama_barang}`,
          message: `${inventory.nama_barang} is out of stock.`,
          type: 'OUT_OF_STOCK',
          inventoryId: inventory.id,
        }));
      }
    }
    return notifications;
  }

  static async checkAllInventoryAlerts(): Promise<StockAlertResult> {
    const [lowStock, outOfStock] = await Promise.all([
      this.checkLowStockAlerts(),
      this.checkOutOfStockAlerts(),
    ]);
    return { lowStock, outOfStock };
  }

  static async getNotificationCount(): Promise<{ total: number; unread: number; byType: Record<NotificationType, number> }> {
    const [total, unread, byTypeResponse] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);
    const byType = {} as Record<NotificationType, number>;
    for (const type of Object.values(NotificationType)) byType[type] = 0;
    for (const item of byTypeResponse) byType[item.type] = item._count.type;
    return { total, unread, byType };
  }

  static async checkPriceDifferenceAlerts(purchaseOrderId: string, poDetails: Array<{ kode_barang: string; nama_barang: string; harga: number; }>): Promise<Notification[]> {
    const notifications: Notification[] = [];
    for (const poDetail of poDetails) {
      const inventory = await prisma.inventory.findUnique({ where: { kode_barang: poDetail.kode_barang } });
      if (inventory) {
        const priceDifference = Math.abs(poDetail.harga - inventory.harga_barang);
        if (priceDifference > (inventory.harga_barang * 0.10)) { // 10% threshold
          const existing = await prisma.notification.findFirst({
            where: { inventoryId: inventory.id, type: 'PRICE_DIFFERENCE', isRead: false, message: { contains: `PO ${purchaseOrderId}` } },
          });
          if (!existing) {
            notifications.push(await this.createNotification({
              title: `Price Difference Alert: ${poDetail.nama_barang}`,
              message: `Price for ${poDetail.nama_barang} in PO ${purchaseOrderId} (Rp ${poDetail.harga}) differs by more than 10% from inventory price (Rp ${inventory.harga_barang}).`,
              type: 'PRICE_DIFFERENCE',
              inventoryId: inventory.id,
            }));
          }
        }
      }
    }
    return notifications;
  }
}
