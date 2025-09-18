import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '@/services/notification.service';
import { 
  CreateNotificationInput, 
  UpdateNotificationInput,
} from '@/schemas/notification.schema';
import { ResponseUtil } from '@/utils/response.util';
import { NotificationType } from '@prisma/client';

export class NotificationController {
  static async createNotification(
    request: FastifyRequest<{ Body: CreateNotificationInput }>,
    reply: FastifyReply
  ) {
    const notification = await NotificationService.createNotification(request.body);
    return reply.code(201).send(ResponseUtil.success(notification));
  }

  static async getAllNotifications(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const notifications = await NotificationService.getAllNotifications();
    return reply.send(ResponseUtil.success(notifications));
  }

  static async getNotificationById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const notification = await NotificationService.getNotificationById(id);
    return reply.send(ResponseUtil.success(notification));
  }

  static async getUnreadNotifications(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const notifications = await NotificationService.getUnreadNotifications();
    return reply.send(ResponseUtil.success(notifications));
  }

  static async getNotificationsByType(
    request: FastifyRequest<{ Params: { type: NotificationType } }>,
    reply: FastifyReply
  ) {
    const { type } = request.params;
    const notifications = await NotificationService.getNotificationsByType(type);
    return reply.send(ResponseUtil.success(notifications));
  }

  static async getPriceDifferenceNotifications(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const notifications = await NotificationService.getNotificationsByType('PRICE_DIFFERENCE');
    return reply.send(ResponseUtil.success(notifications));
  }

  static async updateNotification(
    request: FastifyRequest<{ 
      Params: { id: string }; 
      Body: UpdateNotificationInput['body'] 
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const notification = await NotificationService.updateNotification(id, request.body);
    return reply.send(ResponseUtil.success(notification));
  }

  static async deleteNotification(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const notification = await NotificationService.deleteNotification(id);
    return reply.send(ResponseUtil.success(notification));
  }

  static async markAsRead(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const notification = await NotificationService.markAsRead(id);
    return reply.send(ResponseUtil.success(notification));
  }

  static async markAllAsRead(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const result = await NotificationService.markAllAsRead();
    return reply.send(ResponseUtil.success(result));
  }

  static async getNotificationCount(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const count = await NotificationService.getNotificationCount();
    return reply.send(ResponseUtil.success(count));
  }

  static async checkAllInventoryAlerts(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const alerts = await NotificationService.checkAllInventoryAlerts();
    return reply.send(ResponseUtil.success(alerts));
  }
}
