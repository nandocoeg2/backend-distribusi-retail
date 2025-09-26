import { z } from 'zod';

export const createDimensiKardusSchema = z.object({
  body: z.object({
    inventoryId: z.string().min(1),
    berat: z.number().nonnegative(),
    panjang: z.number().nonnegative(),
    lebar: z.number().nonnegative(),
    tinggi: z.number().nonnegative(),
  }),
});

export const updateDimensiKardusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    inventoryId: z.string().min(1).optional(),
    berat: z.number().nonnegative().optional(),
    panjang: z.number().nonnegative().optional(),
    lebar: z.number().nonnegative().optional(),
    tinggi: z.number().nonnegative().optional(),
  }),
});

export const getDimensiKardusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const getAllDimensiKardusSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

export const searchDimensiKardusSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

export type CreateDimensiKardusInput = z.infer<typeof createDimensiKardusSchema>['body'];
export type UpdateDimensiKardusInput = z.infer<typeof updateDimensiKardusSchema>;
export type GetAllDimensiKardusInput = z.infer<typeof getAllDimensiKardusSchema>;
export type SearchDimensiKardusInput = z.infer<typeof searchDimensiKardusSchema>;
export type GetDimensiKardusInput = z.infer<typeof getDimensiKardusSchema>;


