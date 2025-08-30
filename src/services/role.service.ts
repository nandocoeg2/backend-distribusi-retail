import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

export class RoleService {
  static async getAll() {
    return prisma.role.findMany({
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
      },
    });
  }

  static async updateRoleMenus(roleId: string, menuIds: string[]) {
    // 1. Validate that the role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AppError('Role tidak ditemukan', 404);
    }

    // 2. Validate that all menus exist
    const existingMenus = await prisma.menu.findMany({
      where: {
        id: { in: menuIds },
      },
    });

    if (existingMenus.length !== menuIds.length) {
      const notFoundMenuIds = menuIds.filter(
        (menuId) => !existingMenus.some((menu) => menu.id === menuId)
      );
      throw new AppError(`Menu dengan ID berikut tidak ditemukan: ${notFoundMenuIds.join(', ')}`, 404);
    }

    // 3. Perform the update within a transaction
    return prisma.$transaction(async (tx) => {
      // First, delete all existing menu associations for this role
      await tx.roleMenu.deleteMany({
        where: {
          roleId: roleId,
        },
      });

      // Then, create the new menu associations
      const roleMenuData = menuIds.map((menuId) => ({
        roleId: roleId,
        menuId: menuId,
      }));

      await tx.roleMenu.createMany({
        data: roleMenuData,
      });

      // Return the updated role with its menus
      return tx.role.findUnique({
        where: {
          id: roleId,
        },
        include: {
          menus: {
            include: {
              menu: true,
            },
          },
        },
      });
    });
  }
}
