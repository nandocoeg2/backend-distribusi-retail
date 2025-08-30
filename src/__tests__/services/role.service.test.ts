import { RoleService } from '@/services/role.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

jest.mock('@/config/database', () => ({
  prisma: {
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    roleMenu: {
      deleteMany: jest.fn(),
    },
  },
}));

describe('RoleService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all roles with their menus', async () => {
      const roles = [
        {
          id: '1',
          name: 'Admin',
          menus: [{ menu: { id: '1', name: 'Dashboard' } }],
        },
      ];
      (prisma.role.findMany as jest.Mock).mockResolvedValue(roles);

      const result = await RoleService.getAll();

      expect(prisma.role.findMany).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: '1',
          name: 'Admin',
          menus: [{ id: '1', name: 'Dashboard' }],
        },
      ]);
    });
  });

  describe('create', () => {
    it('should create a new role with menus', async () => {
      const newRole = {
        id: '1',
        name: 'New Role',
        menus: [{ menu: { id: '1', name: 'Dashboard' } }],
      };
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue(newRole);

      const result = await RoleService.create('New Role', ['1']);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'New Role' } });
      expect(prisma.role.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: '1',
        name: 'New Role',
        menus: [{ id: '1', name: 'Dashboard' }],
      });
    });

    it('should throw an error if role already exists', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Admin' });

      await expect(RoleService.create('Admin', ['1'])).rejects.toThrow(
        new AppError(`Role with name 'Admin' already exists`, 409)
      );
    });
  });

  describe('updateMenus', () => {
    it('should update role menus', async () => {
      const updatedRole = {
        id: '1',
        name: 'Admin',
        menus: [{ menu: { id: '2', name: 'Settings' } }],
      };
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Admin' });
      (prisma.role.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await RoleService.updateMenus('1', ['2']);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.role.update).toHaveBeenCalled();
      expect(result).toEqual({
        id: '1',
        name: 'Admin',
        menus: [{ id: '2', name: 'Settings' }],
      });
    });

    it('should throw an error if role not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.updateMenus('1', ['2'])).rejects.toThrow(
        new AppError('Role not found', 404)
      );
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Admin', users: [] });
      (prisma.roleMenu.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.role.delete as jest.Mock).mockResolvedValue({ id: '1' });

      await RoleService.delete('1');

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, include: { users: true } });
      expect(prisma.roleMenu.deleteMany).toHaveBeenCalledWith({ where: { roleId: '1' } });
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw an error if role not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.delete('1')).rejects.toThrow(new AppError('Role not found', 404));
    });

    it('should throw an error if role has associated users', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Admin', users: [{ id: '1' }] });

      await expect(RoleService.delete('1')).rejects.toThrow(
        new AppError('Cannot delete role with associated users', 400)
      );
    });
  });
});
