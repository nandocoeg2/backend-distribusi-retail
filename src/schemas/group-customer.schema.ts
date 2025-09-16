import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createGroupCustomerSchema = z.object({
  body: z.object({
    kode_group: z.string({ required_error: 'Group code is required' }),
    nama_group: z.string({ required_error: 'Group name is required' }),
    alamat: z.string().optional(),
    npwp: z.string().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const getGroupCustomerSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const updateGroupCustomerSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    kode_group: z.string().optional(),
    nama_group: z.string().optional(),
    alamat: z.string().optional(),
    npwp: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const deleteGroupCustomerSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const searchGroupCustomerSchema = z.object({
  params: z.object({
    q: z.string().optional(),
  }),
  query: paginationSchema,
});

export const getAllGroupCustomersSchema = z.object({
  query: paginationSchema,
});

export type CreateGroupCustomerInput = z.infer<typeof createGroupCustomerSchema>['body'];
export type UpdateGroupCustomerInput = z.infer<typeof updateGroupCustomerSchema>;
export type SearchGroupCustomerInput = z.infer<typeof searchGroupCustomerSchema>;
export type GetAllGroupCustomersInput = z.infer<typeof getAllGroupCustomersSchema>;

