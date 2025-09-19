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
  fastify.post('/', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate, validateRequest(createNotificationSchema)] }, NotificationController.createNotification);
  fastify.get('/', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate] }, NotificationController.getAllNotifications);
  fastify.get('/unread', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate] }, NotificationController.getUnreadNotifications);
  fastify.get('/count', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate] }, NotificationController.getNotificationCount);
  fastify.get('/alerts', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate] }, NotificationController.checkAllInventoryAlerts);
  fastify.get('/price-differences', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate] }, NotificationController.getPriceDifferenceNotifications);
  fastify.get('/:id', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate, validateRequest(getNotificationSchema)] }, NotificationController.getNotificationById);
  fastify.get('/type/:type', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate, validateRequest(getNotificationsByTypeSchema)] }, NotificationController.getNotificationsByType);
  fastify.put('/:id', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate, validateRequest(updateNotificationSchema)] }, NotificationController.updateNotification);
  fastify.delete('/:id', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate, validateRequest(deleteNotificationSchema)] }, NotificationController.deleteNotification);
  fastify.patch('/read-all', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate] }, NotificationController.markAllAsRead);
  fastify.patch('/:id/read', { schema: { tags: ['Notification'], security: [{ Bearer: [] }] }, preHandler: [fastify.authenticate, validateRequest(getNotificationSchema)] }, NotificationController.markAsRead);
  done();
};
