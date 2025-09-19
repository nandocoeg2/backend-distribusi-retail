import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3),
    firstName: z.string().min(3),
    lastName: z.string().min(3),
    password: z.string().min(6),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string(), // Changed from uuid() to allow CUIDs
  }),
});

export const getAllUsersSchema = z.object({
  query: paginationSchema,
});
