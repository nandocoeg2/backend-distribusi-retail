import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(2, 'Username must be at least 2 characters long'),
    firstName: z.string().min(2, 'First name must be at least 2 characters long'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters long'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];