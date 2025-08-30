import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Role name is required'),
    menuIds: z.array(z.string()).min(1, 'At least one menu ID is required'),
  }),
});

export const updateRoleMenusSchema = z.object({
  body: z.object({
    menuIds: z.array(z.string()).min(1, 'At least one menu ID is required'),
  }),
  params: z.object({
    roleId: z.string(),
  }),
});

export const deleteRoleSchema = z.object({
  params: z.object({
    roleId: z.string(),
  }),
});
