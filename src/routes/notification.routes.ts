import { FastifyInstance } from 'fastify';
import { NotificationController } from '@/controllers/notification.controller';
import { 
  createNotificationSchema, 
  getNotificationSchema, 
  updateNotificationSchema, 
  deleteNotificationSchema,
  getNotificationsByTypeSchema
} from '@/schemas/notification.schema';

export default async function (fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: createNotificationSchema,
    },
    NotificationController.createNotification
  );

  fastify.get('/', NotificationController.getAllNotifications);

  fastify.get('/unread', NotificationController.getUnreadNotifications);

  fastify.get('/count', NotificationController.getNotificationCount);

  fastify.get('/alerts', NotificationController.checkAllInventoryAlerts);

  fastify.get(
    '/:id',
    {
      schema: getNotificationSchema,
    },
    NotificationController.getNotificationById
  );

  fastify.get(
    '/type/:type',
    {
      schema: getNotificationsByTypeSchema,
    },
    NotificationController.getNotificationsByType
  );

  fastify.put(
    '/:id',
    {
      schema: updateNotificationSchema,
    },
    NotificationController.updateNotification
  );

  fastify.delete(
    '/:id',
    {
      schema: deleteNotificationSchema,
    },
    NotificationController.deleteNotification
  );

  fastify.patch('/read-all', NotificationController.markAllAsRead);

  fastify.patch(
    '/:id/read',
    {
      schema: getNotificationSchema,
    },
    NotificationController.markAsRead
  );
}
