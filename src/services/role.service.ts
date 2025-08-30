import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

export class RoleService {
  static async getAll() {
    const roles = await prisma.role.findMany({
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
      },
    });
    return roles.map((role) => ({
      ...role,
      menus: role.menus.map((roleMenu) => roleMenu.menu),
    }));
  }

  static async create(name: string, menuIds: string[]) {
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new AppError(`Role with name '${name}' already exists`, 409);
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        menus: {
          create: menuIds.map((menuId) => ({
            menu: {
              connect: { id: menuId },
            },
          })),
        },
      },
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
      },
    });

    return {
      ...newRole,
      menus: newRole.menus.map((roleMenu) => roleMenu.menu),
    };
  }

  static async updateMenus(roleId: string, menuIds: string[]) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        menus: {
          deleteMany: {},
          create: menuIds.map((menuId) => ({
            menu: {
              connect: { id: menuId },
            },
          })),
        },
      },
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
      },
    });

    return {
      ...updatedRole,
      menus: updatedRole.menus.map((roleMenu) => roleMenu.menu),
    };
  }

  static async delete(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (role.users.length > 0) {
      throw new AppError('Cannot delete role with associated users', 400);
    }

    await prisma.roleMenu.deleteMany({
      where: { roleId },
    });

    return prisma.role.delete({
      where: { id: roleId },
    });
  }
}
