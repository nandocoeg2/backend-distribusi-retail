import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    address: z.string({ required_error: 'Address is required' }),
    phoneNumber: z.string({ required_error: 'Phone number is required' }),
    email: z.string().email('Not a valid email').optional(),
  }),
});

export const getCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID'),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID'),
  }),
  body: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email('Not a valid email').optional(),
  }),
});

export const deleteCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID'),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
