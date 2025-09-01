import { z } from 'zod';

export const getFileSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

