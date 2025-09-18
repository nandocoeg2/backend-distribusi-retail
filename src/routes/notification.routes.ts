import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify';
import { NotificationController } from '@/controllers/notification.controller';
import { 
  createNotificationSchema, 
  getNotificationSchema, 
  updateNotificationSchema, 
  deleteNotificationSchema,
  getNotificationsByTypeSchema
} from '@/schemas/notification.schema';
import { validateRequest } from '@/middleware/validate-request';

export const notificationRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.post('/', { preHandler: [fastify.authenticate, validateRequest(createNotificationSchema)] }, NotificationController.createNotification);
  fastify.get('/', { preHandler: [fastify.authenticate] }, NotificationController.getAllNotifications);
  fastify.get('/unread', { preHandler: [fastify.authenticate] }, NotificationController.getUnreadNotifications);
  fastify.get('/count', { preHandler: [fastify.authenticate] }, NotificationController.getNotificationCount);
  fastify.get('/alerts', { preHandler: [fastify.authenticate] }, NotificationController.checkAllInventoryAlerts);
  fastify.get('/price-differences', { preHandler: [fastify.authenticate] }, NotificationController.getPriceDifferenceNotifications);
  fastify.get('/:id', { preHandler: [fastify.authenticate, validateRequest(getNotificationSchema)] }, NotificationController.getNotificationById);
  fastify.get('/type/:type', { preHandler: [fastify.authenticate, validateRequest(getNotificationsByTypeSchema)] }, NotificationController.getNotificationsByType);
  fastify.put('/:id', { preHandler: [fastify.authenticate, validateRequest(updateNotificationSchema)] }, NotificationController.updateNotification);
  fastify.delete('/:id', { preHandler: [fastify.authenticate, validateRequest(deleteNotificationSchema)] }, NotificationController.deleteNotification);
  fastify.patch('/read-all', { preHandler: [fastify.authenticate] }, NotificationController.markAllAsRead);
  fastify.patch('/:id/read', { preHandler: [fastify.authenticate, validateRequest(getNotificationSchema)] }, NotificationController.markAsRead);
  done();
};
