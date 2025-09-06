import { z } from 'zod';

export const getBulkUploadStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

