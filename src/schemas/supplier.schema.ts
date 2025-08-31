import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    code: z.string({ required_error: 'Code is required' }),
    address: z.string({ required_error: 'Address is required' }),
    phoneNumber: z.string({ required_error: 'Phone number is required' }),
    email: z.string().email('Not a valid email').optional(),
    bank: z.object({
      name: z.string({ required_error: 'Bank name is required' }),
      account: z.string({ required_error: 'Bank account is required' }),
      holder: z.string({ required_error: 'Bank holder is required' }),
    }),
  }),
});

export const getSupplierSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
  body: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email('Not a valid email').optional(),
    bank: z
      .object({
        name: z.string().optional(),
        account: z.string().optional(),
        holder: z.string().optional(),
      })
      .optional(),
  }),
});

export const deleteSupplierSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
});

export const searchSupplierSchema = z.object({
  params: z.object({
    q: z.string().optional(),
  }),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SearchSupplierInput = z.infer<typeof searchSupplierSchema>;
