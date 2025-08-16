import { AuthService } from '@/services/auth.service';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { hashPassword, comparePassword } from '@/utils/password.utils';
import { signTokens } from '@/utils/jwt.utils';
import { CacheService } from '@/services/cache.service';

jest.mock('@/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@/utils/password.utils', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('@/utils/jwt.utils', () => ({
  signTokens: jest.fn(),
}));

jest.mock('@/services/cache.service', () => ({
  CacheService: {
    set: jest.fn(),
    del: jest.fn(),
  },
}));

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const input = { email: 'test@example.com', name: 'Test User', password: 'password' };
      const hashedPassword = 'hashedPassword';
      const user = { id: '1', email: input.email, username: input.name, password: hashedPassword };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue(user);

      const result = await AuthService.register(input);
      const { password, ...userWithoutPassword } = user;

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: input.email } });
      expect(hashPassword).toHaveBeenCalledWith(input.password);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: { email: input.email, username: input.name, password: hashedPassword } });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should throw an error if user already exists', async () => {
      const input = { email: 'test@example.com', name: 'Test User', password: 'password' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: input.email });

      await expect(AuthService.register(input)).rejects.toThrow(new AppError('User with this email already exists', 409));
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const input = { email: 'test@example.com', password: 'password' };
      const user = { id: '1', email: input.email, password: 'hashedPassword' };
      const tokens = { accessToken: 'accessToken', refreshToken: 'refreshToken' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (signTokens as jest.Mock).mockResolvedValue(tokens);

      const result = await AuthService.login(input);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: input.email } });
      expect(comparePassword).toHaveBeenCalledWith(input.password, user.password);
      expect(signTokens).toHaveBeenCalledWith(user);
      expect(CacheService.set).toHaveBeenCalledWith(`user:${user.id}`, user, 3600);
      expect(result).toEqual({ ...tokens, user: userWithoutPassword });
    });

    it('should throw an error for invalid credentials', async () => {
      const input = { email: 'test@example.com', password: 'password' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login(input)).rejects.toThrow(new AppError('Invalid email or password', 401));
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const userId = '1';
      const token = 'refreshToken';

      await AuthService.logout(userId, token);

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId, refreshToken: token } });
      expect(CacheService.del).toHaveBeenCalledWith(`user:${userId}`);
    });
  });
});