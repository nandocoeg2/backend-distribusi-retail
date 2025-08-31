import { AuthService } from '@/services/auth.service';
import { prisma } from '@/config/database';
import { redisClient as redis } from '@/config/redis';
import { AppError } from '@/utils/app-error';
import { hashPassword, comparePassword } from '@/utils/password.utils';
import { signAccessToken } from '@/utils/jwt.utils';
import { CreateUserInput, LoginInput } from '@/schemas/auth.schema';
import { CacheService } from '@/services/cache.service';

// Mock dependencies
jest.mock('@/config/database', () => ({
    prisma: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
    },
  }));
jest.mock('@/config/redis');
jest.mock('@/utils/password.utils');
jest.mock('@/utils/jwt.utils');
jest.mock('@/services/cache.service');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const userInput: CreateUserInput = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role1', name: 'user' });
      const createdUser = { ...userInput, id: '1', roleId: 'role1', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await AuthService.register(userInput);

      const { password, ...expectedUser } = createdUser;

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userInput.email } });
      expect(hashPassword).toHaveBeenCalledWith(userInput.password);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'user' } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(AuthService.register(userInput)).rejects.toThrow(
        new AppError('User with this email already exists', 409)
      );
    });

    it('should throw an error if default role not found', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
  
        await expect(AuthService.register(userInput)).rejects.toThrow(
          new AppError('Default role not found', 500)
        );
      });
  });

  describe('login', () => {
    const loginInput: LoginInput = { email: 'test@example.com', password: 'password123' };
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: {
        id: 'role1',
        name: 'user',
        menus: [],
      },
    };
    const accessToken = 'access-token';

    it('should login a user and return tokens and user data', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (signAccessToken as jest.Mock).mockResolvedValue(accessToken);
      (CacheService.set as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.login(loginInput);

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(comparePassword).toHaveBeenCalledWith(loginInput.password, user.password);
      expect(signAccessToken).toHaveBeenCalledWith(user);
      expect(CacheService.set).toHaveBeenCalled();
      expect(result.user).toHaveProperty('accessToken', accessToken);
      expect(result.user).toHaveProperty('email', user.email);
    });

    it('should throw an error for invalid credentials', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(AuthService.login(loginInput)).rejects.toThrow(
          new AppError('Invalid email or password', 401)
        );
      });
  });

  describe('logout', () => {
    it('should clear user session data from redis', async () => {
      const userId = '1';
      (redis.del as jest.Mock).mockResolvedValue(1);
      (CacheService.del as jest.Mock).mockResolvedValue(undefined);

      await AuthService.logout(userId);

      expect(redis.del).toHaveBeenCalledWith(`user:${userId}:accessToken`);
      expect(CacheService.del).toHaveBeenCalledWith(`user:${userId}`);
    });
  });
});

