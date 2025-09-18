import { FastifyRequest, FastifyReply } from 'fastify';
import { UserController } from '@/controllers/user.controller';
import { UserService } from '@/services/user.service';
import { ResponseUtil } from '@/utils/response.util';

jest.mock('@/services/user.service');

describe('UserController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      params: {},
    };
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: '1', email: 'test@example.com' }];
      (UserService.getAllUsers as jest.Mock).mockResolvedValue(users);

      await UserController.getUsers(request as FastifyRequest, reply as FastifyReply);

      expect(UserService.getAllUsers).toHaveBeenCalled();
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(users));
    });
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const user = { id: '1', email: 'test@example.com' };
      request.params = { id: '1' };
      (UserService.getUserById as jest.Mock).mockResolvedValue(user);

      await UserController.getUser(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(UserService.getUserById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(user));
    });

    it('should return an error if user not found', async () => {
      request.params = { id: '1' };
      const error = new Error('User not found');
      (UserService.getUserById as jest.Mock).mockRejectedValue(error);

      await expect(
        UserController.getUser(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply)
      ).rejects.toThrow(error);

      expect(UserService.getUserById).toHaveBeenCalledWith('1');
    });
  });
});