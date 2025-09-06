import { z } from 'zod';

export const getBulkUploadStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const getBulkUploadsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'PROCESSED', 'FAILED']).optional(),
  }),
});

export type GetBulkUploadsInput = z.infer<typeof getBulkUploadsSchema>;

