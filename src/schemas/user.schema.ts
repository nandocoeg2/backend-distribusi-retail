import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3),
    firstName: z.string().min(3),
    lastName: z.string().min(3),
    password: z.string().min(6),
    roleId: z.string().min(1, 'Role ID is required'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    username: z.string().min(3).optional(),
    firstName: z.string().min(3).optional(),
    lastName: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    roleId: z.string().min(1, 'Role ID is required').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const searchUserSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
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
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type SearchUserInput = z.infer<typeof searchUserSchema>['query'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];
