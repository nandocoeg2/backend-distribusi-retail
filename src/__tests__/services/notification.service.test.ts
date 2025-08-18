// @ts-nocheck
import { NotificationService } from '@/services/notification.service';
import { prisma } from '@/config/database';
import { NotificationType } from '@prisma/client';

jest.mock('@/config/database', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    inventory: {
      findMany: jest.fn(),
    },
  },
}));

describe('NotificationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const notificationData = {
        title: 'Test Notification',
        message: 'This is a test notification.',
        type: NotificationType.GENERAL,
      };
      const createdNotification = { ...notificationData, id: '1' };
      (prisma.notification.create as jest.Mock).mockResolvedValue(createdNotification);

      const result = await NotificationService.createNotification(notificationData);

      expect(result).toEqual(createdNotification);
      expect(prisma.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ type: NotificationType.GENERAL }) });
    });

    it('should create a notification with default type', async () => {
      const notificationData = {
        title: 'Test Notification',
        message: 'This is a test notification.',
      };
      const createdNotification = { ...notificationData, id: '1', type: 'GENERAL' };
      (prisma.notification.create as jest.Mock).mockResolvedValue(createdNotification);

      const result = await NotificationService.createNotification(notificationData);

      expect(result.type).toEqual('GENERAL');
      expect(prisma.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ type: 'GENERAL' }) });
    });
  });

  describe('getAllNotifications', () => {
    it('should return all notifications', async () => {
      const notifications = [{ id: '1' }, { id: '2' }];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

      const result = await NotificationService.getAllNotifications();

      expect(result).toEqual(notifications);
      expect(prisma.notification.findMany).toHaveBeenCalled();
    });
  });

  describe('getNotificationById', () => {
    it('should return a notification by ID', async () => {
      const notification = { id: '1' };
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(notification);

      const result = await NotificationService.getNotificationById('1');

      expect(result).toEqual(notification);
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, include: { inventory: true } });
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return unread notifications', async () => {
      const notifications = [{ id: '1', isRead: false }];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

      const result = await NotificationService.getUnreadNotifications();

      expect(result).toEqual(notifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({ 
        where: { isRead: false }, 
        include: { inventory: true }, 
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('getNotificationsByType', () => {
    it('should return notifications by type', async () => {
      const notifications = [{ id: '1', type: NotificationType.LOW_STOCK }];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

      const result = await NotificationService.getNotificationsByType(NotificationType.LOW_STOCK);

      expect(result).toEqual(notifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({ 
        where: { type: NotificationType.LOW_STOCK }, 
        include: { inventory: true }, 
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('updateNotification', () => {
    it('should update a notification', async () => {
      const updatedNotification = { id: '1', title: 'Updated' };
      (prisma.notification.update as jest.Mock).mockResolvedValue(updatedNotification);

      const result = await NotificationService.updateNotification('1', { title: 'Updated' });

      expect(result).toEqual(updatedNotification);
      expect(prisma.notification.update).toHaveBeenCalledWith({ 
        where: { id: '1' }, 
        data: { title: 'Updated' }, 
        include: { inventory: true } 
      });
    });

    it('should return null if update fails', async () => {
      (prisma.notification.update as jest.Mock).mockRejectedValue(new Error());
      const result = await NotificationService.updateNotification('1', { title: 'Updated' });
      expect(result).toBeNull();
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const deletedNotification = { id: '1' };
      (prisma.notification.delete as jest.Mock).mockResolvedValue(deletedNotification);

      const result = await NotificationService.deleteNotification('1');

      expect(result).toEqual(deletedNotification);
      expect(prisma.notification.delete).toHaveBeenCalledWith({ where: { id: '1' }, include: { inventory: true } });
    });

    it('should return null if delete fails', async () => {
      (prisma.notification.delete as jest.Mock).mockRejectedValue(new Error());
      const result = await NotificationService.deleteNotification('1');
      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = { id: '1', isRead: true };
      (prisma.notification.update as jest.Mock).mockResolvedValue(notification);

      const result = await NotificationService.markAsRead('1');

      expect(result).toEqual(notification);
      expect(prisma.notification.update).toHaveBeenCalledWith({ 
        where: { id: '1' }, 
        data: { isRead: true }, 
        include: { inventory: true } 
      });
    });

    it('should return null if markAsRead fails', async () => {
      (prisma.notification.update as jest.Mock).mockRejectedValue(new Error());
      const result = await NotificationService.markAsRead('1');
      expect(result).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await NotificationService.markAllAsRead();

      expect(result).toEqual({ count: 5 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({ 
        where: { isRead: false }, 
        data: { isRead: true } 
      });
    });
  });

  describe('getNotificationCount', () => {
    it('should return notification counts', async () => {
      (prisma.notification.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);
      (prisma.notification.groupBy as jest.Mock).mockResolvedValue([
        { type: 'LOW_STOCK', _count: { type: 2 } },
        { type: 'OUT_OF_STOCK', _count: { type: 1 } },
      ]);

      const result = await NotificationService.getNotificationCount();

      expect(result.total).toBe(10);
      expect(result.unread).toBe(3);
      expect(result.byType.LOW_STOCK).toBe(2);
      expect(result.byType.OUT_OF_STOCK).toBe(1);
      expect(result.byType.GENERAL).toBe(0);
      expect(prisma.notification.count).toHaveBeenCalledTimes(2);
      expect(prisma.notification.groupBy).toHaveBeenCalled();
    });

    it('should return zero for types with no notifications', async () => {
      (prisma.notification.count as jest.Mock).mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      (prisma.notification.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await NotificationService.getNotificationCount();

      expect(result.total).toBe(0);
      expect(result.unread).toBe(0);
      expect(result.byType.GENERAL).toBe(0);
      expect(result.byType.LOW_STOCK).toBe(0);
      expect(result.byType.OUT_OF_STOCK).toBe(0);
      expect(result.byType.STOCK_ALERT).toBe(0);
      expect(result.byType.SYSTEM).toBe(0);
    });
  });

  describe('checkLowStockAlerts', () => {
    it('should create notifications for low-stock items', async () => {
      const lowStockInventories = [{ id: 'inv1', nama_barang: 'Item 1', stok_barang: 5 }];
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(lowStockInventories);
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.notification.create as jest.Mock).mockResolvedValue({ id: 'notif1' });

      const result = await NotificationService.checkLowStockAlerts();

      expect(result).toHaveLength(1);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('checkOutOfStockAlerts', () => {
    it('should create notifications for out-of-stock items', async () => {
      const outOfStockInventories = [{ id: 'inv2', nama_barang: 'Item 2', stok_barang: 0 }];
      (prisma.inventory.findMany as jest.Mock).mockResolvedValue(outOfStockInventories);
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.notification.create as jest.Mock).mockResolvedValue({ id: 'notif2' });

      const result = await NotificationService.checkOutOfStockAlerts();

      expect(result).toHaveLength(1);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('checkAllInventoryAlerts', () => {
    it('should check all inventory alerts and return results', async () => {
      const lowStockNotifications = [{ id: 'low1' }];
      const outOfStockNotifications = [{ id: 'out1' }];

      jest.spyOn(NotificationService, 'checkLowStockAlerts').mockResolvedValue(lowStockNotifications);
      jest.spyOn(NotificationService, 'checkOutOfStockAlerts').mockResolvedValue(outOfStockNotifications);

      const result = await NotificationService.checkAllInventoryAlerts();

      expect(result.lowStock).toEqual(lowStockNotifications);
      expect(result.outOfStock).toEqual(outOfStockNotifications);
    });
  });
});
