import { z } from 'zod';

export const getBulkUploadStatusSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the bulk upload job'),
  }),
});

export const getBulkUploadsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING BULK FILE', 'PROCESSING BULK FILE', 'PROCESSED BULK FILE', 'FAILED BULK FILE']).optional().describe('Filter by bulk upload status'),
  }),
});

export type GetBulkUploadsInput = z.infer<typeof getBulkUploadsSchema>;
