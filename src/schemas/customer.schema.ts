import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createCustomerSchema = z.object({
  body: z.object({
    namaCustomer: z.string({ required_error: 'Nama Customer is required' }),
    kodeCustomer: z.string({ required_error: 'Kode Customer is required' }),
    groupCustomerId: z.string({ required_error: 'Group Customer ID is required' }),
    NPWP: z.string().optional(),
    alamatNPWP: z.string().optional(),
    regionId: z.string({ required_error: 'Region ID is required' }),
    alamatPengiriman: z.string({ required_error: 'Alamat Pengiriman is required' }),
    description: z.string().optional(),
    phoneNumber: z.string({ required_error: 'Phone number is required' }),
    email: z.string().email('Not a valid email').optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const getCustomerSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
  body: z.object({
    namaCustomer: z.string().optional(),
    kodeCustomer: z.string().optional(),
    groupCustomerId: z.string().optional(),
    NPWP: z.string().optional(),
    alamatNPWP: z.string().optional(),
    regionId: z.string().optional(),
    alamatPengiriman: z.string().optional(),
    description: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email('Not a valid email').optional(),
    updatedBy: z.string().optional(),
  }),
});

export const deleteCustomerSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
});

export const searchCustomerSchema = z.object({
  params: z.object({
    q: z.string().optional(),
  }),
  query: paginationSchema,
});

export const getAllCustomersSchema = z.object({
  query: paginationSchema,
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>;
export type GetAllCustomersInput = z.infer<typeof getAllCustomersSchema>;

