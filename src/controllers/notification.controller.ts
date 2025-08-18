import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '@/services/notification.service';
import { 
  CreateNotificationInput, 
  UpdateNotificationInput, 
  getNotificationSchema,
  getNotificationsByTypeSchema
} from '@/schemas/notification.schema';

export class NotificationController {
  static async createNotification(
    request: FastifyRequest<{ Body: CreateNotificationInput }>,
    reply: FastifyReply
  ) {
    try {
      const notification = await NotificationService.createNotification(request.body);
      return reply.code(201).send({
        success: true,
        data: notification,
        message: 'Notification created successfully',
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to create notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getAllNotifications(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const notifications = await NotificationService.getAllNotifications();
      return reply.code(200).send({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getNotificationById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const notification = await NotificationService.getNotificationById(id);

      if (!notification) {
        return reply.code(404).send({
          success: false,
          error: 'Notification not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: notification,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getUnreadNotifications(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const notifications = await NotificationService.getUnreadNotifications();
      return reply.code(200).send({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch unread notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getNotificationsByType(
    request: FastifyRequest<{ Params: { type: 'GENERAL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'STOCK_ALERT' | 'SYSTEM' } }>,
    reply: FastifyReply
  ) {
    try {
      const { type } = request.params;
      const notifications = await NotificationService.getNotificationsByType(type);
      return reply.code(200).send({
        success: true,
        data: notifications,
        count: notifications.length,
        type,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch notifications by type',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async updateNotification(
    request: FastifyRequest<{ 
      Params: { id: string }; 
      Body: UpdateNotificationInput['body'] 
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const notification = await NotificationService.updateNotification(id, request.body);

      if (!notification) {
        return reply.code(404).send({
          success: false,
          error: 'Notification not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: notification,
        message: 'Notification updated successfully',
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to update notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async deleteNotification(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const notification = await NotificationService.deleteNotification(id);

      if (!notification) {
        return reply.code(404).send({
          success: false,
          error: 'Notification not found',
        });
      }

      return reply.code(200).send({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async markAsRead(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const notification = await NotificationService.markAsRead(id);

      if (!notification) {
        return reply.code(404).send({
          success: false,
          error: 'Notification not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: notification,
        message: 'Notification marked as read',
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark notification as read',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async markAllAsRead(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const result = await NotificationService.markAllAsRead();
      return reply.code(200).send({
        success: true,
        data: result,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to mark all notifications as read',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getNotificationCount(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const count = await NotificationService.getNotificationCount();
      return reply.code(200).send({
        success: true,
        data: count,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get notification count',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async checkAllInventoryAlerts(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const alerts = await NotificationService.checkAllInventoryAlerts();
      return reply.code(200).send({
        success: true,
        data: alerts,
        message: 'Inventory alerts checked successfully',
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to check inventory alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
