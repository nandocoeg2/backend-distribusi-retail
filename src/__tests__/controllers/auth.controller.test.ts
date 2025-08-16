import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthController } from '@/controllers/auth.controller';
import { AuthService } from '@/services/auth.service';
import { AppError } from '@/utils/app-error';

jest.mock('@/services/auth.service');

describe('AuthController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      cookies: {},
      user: undefined,
    } as Partial<FastifyRequest>;
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
      clearCookie: jest.fn().mockReturnThis(),
    } as Partial<FastifyReply>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userInput = { email: 'test@example.com', name: 'Test User', password: 'password' };
      request.body = userInput;
      const user = { id: '1', email: 'test@example.com' };
      (AuthService.register as jest.Mock).mockResolvedValue(user);

      await AuthController.register(request as FastifyRequest<{ Body: typeof userInput }>, reply as FastifyReply);

      expect(AuthService.register).toHaveBeenCalledWith(userInput);
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(user);
    });

    it('should handle AppError during registration', async () => {
      const userInput = { email: 'test@example.com', name: 'Test User', password: 'password' };
      request.body = userInput;
      const error = new AppError('User already exists', 409);
      (AuthService.register as jest.Mock).mockRejectedValue(error);

      await AuthController.register(request as FastifyRequest<{ Body: typeof userInput }>, reply as FastifyReply);

      expect(reply.code).toHaveBeenCalledWith(409);
      expect(reply.send).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginInput = { email: 'test@example.com', password: 'password' };
      request.body = loginInput;
      const loginData = { accessToken: 'access', refreshToken: 'refresh', user: { id: '1' } };
      (AuthService.login as jest.Mock).mockResolvedValue(loginData);

      await AuthController.login(request as FastifyRequest<{ Body: typeof loginInput }>, reply as FastifyReply);

      expect(AuthService.login).toHaveBeenCalledWith(loginInput);
      expect(reply.send).toHaveBeenCalledWith(loginData);
    });

    it('should handle AppError during login', async () => {
      const loginInput = { email: 'test@example.com', password: 'password' };
      request.body = loginInput;
      const error = new AppError('Invalid credentials', 401);
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      await AuthController.login(request as FastifyRequest<{ Body: typeof loginInput }>, reply as FastifyReply);

      expect(reply.code).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      request.cookies = { refreshToken: 'refresh' };
      request.user = { id: '1', iat: 1, exp: 1 };

      await AuthController.logout(request as FastifyRequest, reply as FastifyReply);

      expect(AuthService.logout).toHaveBeenCalledWith('1', 'refresh');
      expect(reply.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(reply.send).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should handle AppError for missing refresh token', async () => {
      await AuthController.logout(request as FastifyRequest, reply as FastifyReply);

      expect(reply.code).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Refresh token not found' });
    });

    it('should handle AppError for missing user', async () => {
      request.cookies = { refreshToken: 'refresh' };
      request.user = undefined;

      await AuthController.logout(request as FastifyRequest, reply as FastifyReply);

      expect(reply.code).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({ message: 'User not authenticated' });
    });
  });
});