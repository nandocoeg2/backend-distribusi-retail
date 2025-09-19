import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createCustomerSchema = z.object({
  body: z.object({
    namaCustomer: z.string({ required_error: 'Nama Customer is required' }).describe('Customer name'),
    kodeCustomer: z.string({ required_error: 'Kode Customer is required' }).describe('Customer code'),
    groupCustomerId: z.string({ required_error: 'Group Customer ID is required' }).describe('Group Customer ID'),
    NPWP: z.string().optional().describe('Taxpayer identification number'),
    alamatNPWP: z.string().optional().describe('Taxpayer address'),
    regionId: z.string({ required_error: 'Region ID is required' }).describe('Region ID'),
    alamatPengiriman: z.string({ required_error: 'Alamat Pengiriman is required' }).describe('Shipping address'),
    description: z.string().optional().describe('Customer description'),
    phoneNumber: z.string({ required_error: 'Phone number is required' }).describe('Phone number'),
    email: z.string().email('Not a valid email').optional().describe('Email address'),
    createdBy: z.string().optional().describe('User who created the customer'),
    updatedBy: z.string().optional().describe('User who updated the customer'),
  }),
});

export const getCustomerSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the customer'),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the customer'),
  }),
  body: z.object({
    namaCustomer: z.string().optional().describe('Customer name'),
    kodeCustomer: z.string().optional().describe('Customer code'),
    groupCustomerId: z.string().optional().describe('Group Customer ID'),
    NPWP: z.string().optional().describe('Taxpayer identification number'),
    alamatNPWP: z.string().optional().describe('Taxpayer address'),
    regionId: z.string().optional().describe('Region ID'),
    alamatPengiriman: z.string().optional().describe('Shipping address'),
    description: z.string().optional().describe('Customer description'),
    phoneNumber: z.string().optional().describe('Phone number'),
    email: z.string().email('Not a valid email').optional().describe('Email address'),
    updatedBy: z.string().optional().describe('User who updated the customer'),
  }),
});

export const deleteCustomerSchema = z.object({
  params: z.object({
    id: z.string().describe('The ID of the customer'),
  }),
});

export const searchCustomerSchema = z.object({
  query: z.object({
    q: z.string().optional().describe('Search query'),
  }).merge(paginationSchema),
});

export const getAllCustomersSchema = z.object({
  query: paginationSchema,
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>;
export type GetAllCustomersInput = z.infer<typeof getAllCustomersSchema>;

