import { Notification, NotificationType } from '@prisma/client';
import { prisma } from '@/config/database';

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
      include: {
        inventory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      skip: 0,
    });
  }

  static async getNotificationById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });
  }

  static async getUnreadNotifications(): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { isRead: false },
      include: {
        inventory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getNotificationsByType(type: NotificationType): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { type },
      include: {
        inventory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async updateNotification(
    id: string,
    data: UpdateNotificationInput
  ): Promise<Notification | null> {
    try {
      return await prisma.notification.update({
        where: { id },
        data,
        include: {
          inventory: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  static async deleteNotification(id: string): Promise<Notification | null> {
    try {
      return await prisma.notification.delete({
        where: { id },
        include: {
          inventory: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  static async markAsRead(id: string): Promise<Notification | null> {
    try {
      return await prisma.notification.update({
        where: { id },
        data: { isRead: true },
        include: {
          inventory: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  static async markAllAsRead(): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    
    return { count: result.count };
  }

  static async checkLowStockAlerts(): Promise<Notification[]> {
    const inventories = await prisma.inventory.findMany();
    const lowStockInventories = inventories.filter(
      (inventory) => inventory.stok_barang <= inventory.min_stok
    );

    const notifications: Notification[] = [];

    for (const inventory of lowStockInventories) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          inventoryId: inventory.id,
          type: 'LOW_STOCK',
          isRead: false,
        },
      });

      if (!existingNotification) {
        const notification = await this.createNotification({
          title: `Low Stock Alert: ${inventory.nama_barang}`,
          message: `Stock for ${inventory.nama_barang} is running low. Current stock: ${inventory.stok_barang}, Minimum stock: ${inventory.min_stok}`,
          type: 'LOW_STOCK',
          inventoryId: inventory.id,
        });
        notifications.push(notification);
      }
    }

    return notifications;
  }

  static async checkOutOfStockAlerts(): Promise<Notification[]> {
    const outOfStockInventories = await prisma.inventory.findMany({
      where: {
        stok_barang: 0,
      },
    });

    const notifications: Notification[] = [];

    for (const inventory of outOfStockInventories) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          inventoryId: inventory.id,
          type: 'OUT_OF_STOCK',
          isRead: false,
        },
      });

      if (!existingNotification) {
        const notification = await this.createNotification({
          title: `Out of Stock: ${inventory.nama_barang}`,
          message: `${inventory.nama_barang} is completely out of stock. Please restock immediately.`,
          type: 'OUT_OF_STOCK',
          inventoryId: inventory.id,
        });
        notifications.push(notification);
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

  static async getNotificationCount(): Promise<{ 
    total: number; 
    unread: number; 
    byType: Record<NotificationType, number> 
  }> {
    const [total, unread, byTypeResponse] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
      }),
    ]);

    const byType = Object.fromEntries(
      byTypeResponse.map((item) => [item.type, item._count.type || 0])
    ) as Record<NotificationType, number>;

    for (const type of Object.values(NotificationType)) {
      if (!(type in byType)) {
        byType[type] = 0;
      }
    }

    return { total, unread, byType };
  }

  static async checkPriceDifferenceAlerts(
    purchaseOrderId: string,
    poDetails: Array<{
      kode_barang: string;
      nama_barang: string;
      harga: number;
      harga_netto: number;
    }>
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const poDetail of poDetails) {
      // Cari inventory dengan kode_barang yang sama
      const inventory = await prisma.inventory.findUnique({
        where: { kode_barang: poDetail.kode_barang }
      });

      if (inventory) {
        // Bandingkan harga PO dengan harga inventory
        const priceDifference = Math.abs(poDetail.harga - inventory.harga_barang);
        const priceDifferencePercentage = (priceDifference / inventory.harga_barang) * 100;

        // Jika perbedaan harga lebih dari 10%, buat notifikasi
        if (priceDifferencePercentage > 10) {
          const existingNotification = await prisma.notification.findFirst({
            where: {
              inventoryId: inventory.id,
              type: 'PRICE_DIFFERENCE',
              isRead: false,
              message: {
                contains: `PO ${purchaseOrderId}`
              }
            },
          });

          if (!existingNotification) {
            const notification = await this.createNotification({
              title: `Perbedaan Harga: ${poDetail.nama_barang}`,
              message: `Harga barang ${poDetail.nama_barang} di PO ${purchaseOrderId} (Rp ${poDetail.harga.toLocaleString()}) berbeda ${priceDifferencePercentage.toFixed(1)}% dengan harga di inventory (Rp ${inventory.harga_barang.toLocaleString()})`,
              type: 'PRICE_DIFFERENCE',
              inventoryId: inventory.id,
            });
            notifications.push(notification);
          }
        }
      }
    }

    return notifications;
  }
}

