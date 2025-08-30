import { RoleService } from '@/services/role.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

// Mock the entire prisma module
jest.mock('@/config/database', () => ({
  prisma: {
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    menu: {
      findMany: jest.fn(),
    },
    roleMenu: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('RoleService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all roles with their menus from the database', async () => {
      const mockRoles = [
        { id: '1', name: 'Admin', menus: [] },
        { id: '2', name: 'User', menus: [] },
      ];
      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const roles = await RoleService.getAll();

      expect(prisma.role.findMany).toHaveBeenCalledWith({
        include: {
          menus: {
            include: {
              menu: true,
            },
          },
        },
      });
      expect(roles).toEqual(mockRoles);
    });
  });

  describe('updateRoleMenus', () => {
    const roleId = 'role-1';
    const menuIds = ['menu-1', 'menu-2'];
    const mockRole = { id: roleId, name: 'Admin' };
    const mockMenus = [{ id: 'menu-1', name: 'Dashboard' }, { id: 'menu-2', name: 'Settings' }];

    it('should throw an AppError if the role is not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.updateRoleMenus(roleId, menuIds)).rejects.toThrow(
        new AppError('Role tidak ditemukan', 404)
      );
    });

    it('should throw an AppError if some menus are not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      // Simulate only one menu found
      (prisma.menu.findMany as jest.Mock).mockResolvedValue([mockMenus[0]]);

      await expect(RoleService.updateRoleMenus(roleId, menuIds)).rejects.toThrow(
        new AppError('Menu dengan ID berikut tidak ditemukan: menu-2', 404)
      );
    });

    it('should update role menus successfully within a transaction', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.menu.findMany as jest.Mock).mockResolvedValue(mockMenus);

      const mockUpdatedRole = { ...mockRole, menus: mockMenus };

      // Define the mock transaction client outside the implementation
      const txMockClient = {
        roleMenu: {
          deleteMany: jest.fn(),
          createMany: jest.fn(),
        },
        role: {
          findUnique: jest.fn().mockResolvedValue(mockUpdatedRole),
        },
      };

      // Mock the transaction to use the externally defined client
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(txMockClient);
      });

      const result = await RoleService.updateRoleMenus(roleId, menuIds);

      // Assertions
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(txMockClient.roleMenu.deleteMany).toHaveBeenCalledWith({ where: { roleId } });
      expect(txMockClient.roleMenu.createMany).toHaveBeenCalledWith({
        data: menuIds.map((menuId) => ({ roleId, menuId })),
      });
      expect(txMockClient.role.findUnique).toHaveBeenCalledWith({
        where: { id: roleId },
        include: { menus: { include: { menu: true } } },
      });

      expect(result).toEqual(mockUpdatedRole);
    });
  });
});
