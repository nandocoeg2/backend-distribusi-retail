import { z } from 'zod';

export const getBulkUploadStatusSchema = z.object({
  params: z.object({
    bulkId: z.string().describe('The bulk ID of the upload job'),
  }),
});

export const getBulkUploadsSchema = z.object({
  query: z.object({
    status: z.enum([
      'processed', 
      'pending',
      'PENDING BULK FILE',
      'PROCESSING BULK FILE',
      'PROCESSED BULK FILE',
      'FAILED BULK FILE',
      'PENDING BULK PURCHASE ORDER',
      'PROCESSING BULK PURCHASE ORDER', 
      'COMPLETED BULK PURCHASE ORDER',
      'FAILED BULK PURCHASE ORDER'
    ]).optional().describe('Filter by bulk upload status'),
  }),
});

export type GetBulkUploadsInput = z.infer<typeof getBulkUploadsSchema>;
