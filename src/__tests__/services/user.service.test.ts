import { UserService } from '@/services/user.service';
import { prisma } from '@/config/database';
import { CacheService } from '@/services/cache.service';

jest.mock('@/config/database', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/services/cache.service', () => ({
  CacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return cached users if available', async () => {
      const cachedUsers = [{ id: '1', email: 'test@example.com' }];
      (CacheService.get as jest.Mock).mockResolvedValue(cachedUsers);

      const result = await UserService.getAllUsers();

      expect(CacheService.get).toHaveBeenCalledWith('users:all');
      expect(result).toEqual(cachedUsers);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should fetch users from database if not cached', async () => {
      const users = [{ id: '1', email: 'test@example.com' }];
      (CacheService.get as jest.Mock).mockResolvedValue(null);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await UserService.getAllUsers();

      expect(CacheService.get).toHaveBeenCalledWith('users:all');
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(CacheService.set).toHaveBeenCalledWith('users:all', users, 600);
      expect(result).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('should return cached user if available', async () => {
      const cachedUser = { id: '1', email: 'test@example.com' };
      (CacheService.get as jest.Mock).mockResolvedValue(cachedUser);

      const result = await UserService.getUserById('1');

      expect(CacheService.get).toHaveBeenCalledWith('user:1');
      expect(result).toEqual(cachedUser);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch user from database if not cached', async () => {
      const user = { id: '1', email: 'test@example.com' };
      (CacheService.get as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await UserService.getUserById('1');

      expect(CacheService.get).toHaveBeenCalledWith('user:1');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, select: expect.any(Object) });
      expect(CacheService.set).toHaveBeenCalledWith('user:1', user, 3600);
      expect(result).toEqual(user);
    });

    it('should throw an error if user not found', async () => {
      (CacheService.get as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(UserService.getUserById('1')).rejects.toThrow('User not found');
      expect(CacheService.set).not.toHaveBeenCalled();
    });
  });
});