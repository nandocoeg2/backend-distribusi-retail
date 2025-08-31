import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { redisClient as redis } from '@/config/redis';
import { signToken, verifyToken, signAccessToken, signRefreshToken } from '@/utils/jwt.utils';
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
      const options = { expiresIn: 3600 };
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const token = signToken(payload, secret, options);

      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, options);
      expect(token).toBe('signed-token');
    });
  });

  describe('verifyToken', () => {
    it('should return valid for a correct token', () => {
      const token = 'valid-token';
      const secret = environment.JWT_SECRET;
      const decodedPayload = { sub: '1' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = verifyToken(token, secret);

      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
      expect(result.decoded).toEqual(decodedPayload);
    });

    it('should return expired for an expired token', () => {
      const token = 'expired-token';
      const secret = environment.JWT_SECRET;
      const error = new Error('TokenExpiredError');
      error.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const result = verifyToken(token, secret);

      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
      expect(result.decoded).toBeNull();
    });
  });

  describe('signAccessToken', () => {
    it('should sign an access token and store it in Redis', async () => {
      const accessToken = 'access-token';
      (jwt.sign as jest.Mock).mockReturnValue(accessToken);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await signAccessToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: user.id },
        environment.JWT_SECRET,
        { expiresIn: Number(environment.JWT_EXPIRES_IN) }
      );
      expect(redis.set).toHaveBeenCalledWith(
        `user:${user.id}:accessToken`,
        accessToken,
        { EX: Number(environment.JWT_EXPIRES_IN) }
      );
      expect(result).toBe(accessToken);
    });
  });

  describe('signRefreshToken', () => {
    it('should sign a refresh token and store it in Redis', async () => {
      const refreshToken = 'refresh-token';
      (jwt.sign as jest.Mock).mockReturnValue(refreshToken);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await signRefreshToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: user.id },
        environment.JWT_REFRESH_SECRET,
        { expiresIn: Number(environment.JWT_REFRESH_EXPIRES_IN) }
      );
      expect(redis.set).toHaveBeenCalledWith(
        `user:${user.id}:refreshToken`,
        refreshToken,
        { EX: Number(environment.JWT_REFRESH_EXPIRES_IN) }
      );
      expect(result).toBe(refreshToken);
    });
  });
});
