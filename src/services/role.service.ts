import { prisma } from '@/config/database';

export class RoleService {
  static async getAll() {
    return prisma.role.findMany();
  }
}