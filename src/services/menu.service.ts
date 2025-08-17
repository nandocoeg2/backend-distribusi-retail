import { prisma } from '@/config/database';

export class MenuService {
  static async getAll() {
    return prisma.menu.findMany({
      include: {
        children: true,
      },
    });
  }
}