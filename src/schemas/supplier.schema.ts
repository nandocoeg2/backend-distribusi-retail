import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).describe('Supplier name'),
    code: z.string().optional().describe('Supplier code'),
    description: z.string().optional().describe('Supplier description'),
    address: z.string().optional().describe('Supplier address'),
    phoneNumber: z.string({ required_error: 'Phone number is required' }).describe('Supplier phone number'),
    email: z.string().email('Not a valid email').optional().describe('Supplier email address'),
    createdBy: z.string().optional().describe('User who created the supplier'),
    updatedBy: z.string().optional().describe('User who updated the supplier'),
    bank: z.object({
      name: z.string({ required_error: 'Bank name is required' }).describe('Bank name'),
      account: z.string({ required_error: 'Bank account is required' }).describe('Bank account number'),
      holder: z.string({ required_error: 'Bank holder is required' }).describe('Bank account holder name'),
    }).optional().describe('Bank details'),
  }),
});

export const getSupplierSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the supplier'),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the supplier'),
  }),
  body: z.object({
    name: z.string().optional().describe('Supplier name'),
    code: z.string().optional().describe('Supplier code'),
    description: z.string().optional().describe('Supplier description'),
    address: z.string().optional().describe('Supplier address'),
    phoneNumber: z.string().optional().describe('Supplier phone number'),
    email: z.string().email('Not a valid email').optional().describe('Supplier email address'),
    updatedBy: z.string().optional().describe('User who updated the supplier'),
    bank: z
      .object({
        name: z.string().optional().describe('Bank name'),
        account: z.string().optional().describe('Bank account number'),
        holder: z.string().optional().describe('Bank account holder name'),
      })
      .optional().describe('Bank details'),
  }),
});

export const deleteSupplierSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the supplier'),
  }),
});

export const searchSupplierSchema = z.object({
  params: z.object({
    q: z.string().optional().describe('Search query'),
  }),
  query: paginationSchema,
});

export const getAllSuppliersSchema = z.object({
  query: paginationSchema,
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SearchSupplierInput = z.infer<typeof searchSupplierSchema>;
export type GetAllSuppliersInput = z.infer<typeof getAllSuppliersSchema>;
