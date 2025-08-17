import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { redisClient as redis } from '@/config/redis';
import { signToken, verifyToken, signTokens, reissueAccessToken } from '@/utils/jwt.utils';
import { environment } from '@/config/environment';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('@/config/redis');

describe('JWT Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const user: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'password',
    firstName: 'Test',
    lastName: 'User',
    roleId: 'role1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('signToken', () => {
    it('should sign a payload into a JWT', () => {
      const payload = { sub: user.id };
      const secret = 'secret';
      const expiresIn = '3600';
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const token = signToken(payload, secret, expiresIn);

      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, { expiresIn: 3600 });
      expect(token).toBe('signed-token');
    });
  });

  describe('verifyToken', () => {
    it('should return valid for a correct token', () => {
      const token = 'valid-token';
      const decodedPayload = { sub: '1' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = verifyToken(token);

      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
      expect(result.decoded).toEqual(decodedPayload);
    });

    it('should return expired for an expired token', () => {
      const token = 'expired-token';
      const error = new Error('TokenExpiredError');
      error.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const result = verifyToken(token);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
      expect(result.decoded).toBeNull();
    });
  });

  describe('signTokens', () => {
    it('should sign access and refresh tokens and store them in Redis', async () => {
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await signTokens(user);

      expect(redis.set).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });
  });

  describe('reissueAccessToken', () => {
    it('should reissue an access token with a valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      (jwt.verify as jest.Mock).mockReturnValue({ sub: user.id });
      (redis.get as jest.Mock).mockResolvedValue(refreshToken);
      (jwt.sign as jest.Mock).mockReturnValue('new-access-token');

      const newAccessToken = await reissueAccessToken(refreshToken);

      expect(redis.get).toHaveBeenCalledWith(`user:${user.id}:refreshToken`);
      expect(newAccessToken).toBe('new-access-token');
      expect(redis.set).toHaveBeenCalledWith(`user:${user.id}:accessToken`, 'new-access-token', expect.any(Object));
    });

    it('should return false for an invalid or expired refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });

      const result = await reissueAccessToken(refreshToken);

      expect(result).toBe(false);
    });
  });
});

