import jwt from 'jsonwebtoken';
import { signToken, verifyToken, signTokens } from '@/utils/jwt.utils';
import { prisma } from '@/config/database';
import { environment } from '@/config/environment';

jest.mock('jsonwebtoken');
jest.mock('@/config/database');


describe('JWT Utils', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('signToken', () => {
    it('should call jwt.sign with correct parameters', () => {
      const payload = { sub: '123' };
      const secret = 'secret';
      const expiresIn = '1h';
      signToken(payload, secret, expiresIn);
      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, { expiresIn: parseInt(expiresIn) });
    });
  });

  describe('verifyToken', () => {
    it('should return valid true with decoded payload for a valid token', () => {
      const token = 'valid-token';
      const secret = 'secret';
      const decodedPayload = { sub: '123' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = verifyToken(token, secret);

      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
      expect(result).toEqual({ valid: true, expired: false, decoded: decodedPayload });
    });

    it('should return valid false and expired true for an expired token', () => {
      const token = 'expired-token';
      const secret = 'secret';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const result = verifyToken(token, secret);

      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
      expect(result).toEqual({ valid: false, expired: true, decoded: null });
    });

    it('should return valid false and expired false for an invalid token', () => {
      const token = 'invalid-token';
      const secret = 'secret';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken(token, secret);

      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
      expect(result).toEqual({ valid: false, expired: false, decoded: null });
    });
  });

  describe('signTokens', () => {
    it('should sign access and refresh tokens and create a session', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      (jwt.sign as jest.Mock)
        .mockImplementation((payload, secret) => {
          if (secret === environment.JWT_SECRET) return accessToken;
          if (secret === environment.JWT_REFRESH_SECRET) return refreshToken;
          return 'generic-token';
        });

      

            (prisma.session.create as jest.Mock).mockResolvedValue({ id: '1', userId: user.id, refreshToken, expiresAt: new Date() });

      const result = await signTokens(user);

      expect(jwt.sign).toHaveBeenCalledWith({ sub: user.id }, environment.JWT_SECRET, { expiresIn: parseInt(environment.JWT_EXPIRES_IN) });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: user.id }, environment.JWT_REFRESH_SECRET, { expiresIn: parseInt(environment.JWT_REFRESH_EXPIRES_IN) });
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: user.id,
          refreshToken: refreshToken,
          expiresAt: expect.any(Date),
        },
      });
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });
});