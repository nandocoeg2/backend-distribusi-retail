import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createRegionSchema = z.object({
  body: z.object({
    kode_region: z.string({ required_error: 'Region code is required' }),
    nama_region: z.string({ required_error: 'Region name is required' }),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const getRegionSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
});

export const updateRegionSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
  body: z.object({
    kode_region: z.string().optional(),
    nama_region: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const deleteRegionSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
});

export const searchRegionSchema = z.object({
  params: z.object({
    q: z.string().optional(),
  }),
  query: paginationSchema,
});

export const getAllRegionsSchema = z.object({
  query: paginationSchema,
});

export type CreateRegionInput = z.infer<typeof createRegionSchema>['body'];
export type UpdateRegionInput = z.infer<typeof updateRegionSchema>;
export type SearchRegionInput = z.infer<typeof searchRegionSchema>;
export type GetAllRegionsInput = z.infer<typeof getAllRegionsSchema>;
