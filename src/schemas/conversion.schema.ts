import { z } from 'zod';

export const conversionSchema = z.object({
  prompt: z.string(),
});

export type ConversionInput = z.infer<typeof conversionSchema>;
