import { z } from 'zod';

export const updateRoleMenusSchema = z.object({
  role: z.string(),
  menu: z.array(z.string()).min(1, 'Minimal 1 menu harus dipilih'),
});

