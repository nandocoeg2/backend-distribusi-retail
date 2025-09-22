import { UserService } from '@/services/user.service';
import { prisma } from '@/config/database';
import { CacheService } from '@/services/cache.service';
import { AppError } from '@/utils/app-error';

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const users = [
        { id: '1', email: 'test@example.com', username: 'tester' },
        { id: '2', email: 'demo@example.com', username: 'demo' },
      ];

      const findManySpy = jest
        .spyOn(prisma.user, 'findMany')
        .mockResolvedValue(users as any);
      const countSpy = jest
        .spyOn(prisma.user, 'count')
        .mockResolvedValue(users.length);

      const result = await UserService.getAllUsers(1, 10);

      expect(findManySpy).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: expect.objectContaining({ id: true, email: true }),
        orderBy: { createdAt: 'desc' },
      });
      expect(countSpy).toHaveBeenCalled();
      expect(result).toEqual({
        data: users,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: users.length,
          itemsPerPage: 10,
        },
      });
    });
  });

  describe('getUserById', () => {
    it('should return cached user if available', async () => {
      const cachedUser = { id: '1', email: 'cached@example.com' } as any;
      const cacheGetSpy = jest
        .spyOn(CacheService, 'get')
        .mockResolvedValue(cachedUser);

      const result = await UserService.getUserById('1');

      expect(cacheGetSpy).toHaveBeenCalledWith('user:1');
      expect(result).toEqual(cachedUser);
    });

    it('should fetch user from database when not cached', async () => {
      const user = { id: '1', email: 'db@example.com' } as any;
      jest.spyOn(CacheService, 'get').mockResolvedValue(null);
      const findUniqueSpy = jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(user);
      const cacheSetSpy = jest.spyOn(CacheService, 'set').mockResolvedValue(true);

      const result = await UserService.getUserById('1');

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.objectContaining({ id: true, email: true }),
      });
      expect(cacheSetSpy).toHaveBeenCalledWith('user:1', user, 3600);
      expect(result).toEqual(user);
    });

    it('should throw AppError when user not found', async () => {
      jest.spyOn(CacheService, 'get').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(UserService.getUserById('1')).rejects.toThrow(AppError);
    });
  });
});
