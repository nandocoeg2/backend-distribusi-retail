import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    message: z.string({ required_error: 'Message is required' }),
    type: z.enum(['GENERAL', 'LOW_STOCK', 'OUT_OF_STOCK', 'STOCK_ALERT', 'SYSTEM']).optional().default('GENERAL'),
    inventoryId: z.string().optional(),
    isRead: z.boolean().optional().default(false),
  }),
});

export const getNotificationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const updateNotificationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional(),
    message: z.string().optional(),
    type: z.enum(['GENERAL', 'LOW_STOCK', 'OUT_OF_STOCK', 'STOCK_ALERT', 'SYSTEM']).optional(),
    isRead: z.boolean().optional(),
  }),
});

export const deleteNotificationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const getNotificationsByTypeSchema = z.object({
  params: z.object({
    type: z.enum(['GENERAL', 'LOW_STOCK', 'OUT_OF_STOCK', 'STOCK_ALERT', 'SYSTEM']),
  }),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>['body'];
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
