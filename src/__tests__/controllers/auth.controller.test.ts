import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthController } from '@/controllers/auth.controller';
import { AuthService } from '@/services/auth.service';
import { ResponseUtil } from '@/utils/response.util';
import { AppError } from '@/utils/app-error';
import { CreateUserInput, LoginInput } from '@/schemas/auth.schema';

jest.mock('@/services/auth.service');

describe('AuthController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      user: undefined,
    } as Partial<FastifyRequest>;
    reply = {
      code: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as Partial<FastifyReply>;
  });

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

    it('should register a new user and return 201', async () => {
      request.body = userInput;
      const user = { id: '1', email: userInput.email };
      (AuthService.register as jest.Mock).mockResolvedValue(user);

      await AuthController.register(request as FastifyRequest<{ Body: CreateUserInput }>, reply as FastifyReply);

      expect(AuthService.register).toHaveBeenCalledWith(userInput);
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(user));
    });
  });

  describe('login', () => {
    const loginInput: LoginInput = { email: 'test@example.com', password: 'password' };
    const mockUser = { id: '1' };
    const loginData = { user: mockUser, accessToken: 'access-token' };

    it('should login a user and return user data with access token', async () => {
      request.body = loginInput;
      (AuthService.login as jest.Mock).mockResolvedValue(loginData);

      await AuthController.login(request as FastifyRequest<{ Body: LoginInput }>, reply as FastifyReply);

      expect(AuthService.login).toHaveBeenCalledWith(loginInput);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(loginData));
    });

    it('should handle login errors', async () => {
        request.body = loginInput;
        const error = new AppError('Invalid credentials', 401);
        (AuthService.login as jest.Mock).mockRejectedValue(error);
  
        await AuthController.login(request as FastifyRequest<{ Body: LoginInput }>, reply as FastifyReply);
  
        expect(reply.status).toHaveBeenCalledWith(401);
        expect(reply.send).toHaveBeenCalledWith(ResponseUtil.error('Invalid credentials'));
      });
  });

  describe('logout', () => {
    it('should logout a user if authenticated', async () => {
      request.user = { id: '1', iat: 123456, exp: 123456 }; // Mock authenticated user

      await AuthController.logout(request as FastifyRequest, reply as FastifyReply);

      expect(AuthService.logout).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success({ message: 'Logged out successfully' }));
    });
  });
});
