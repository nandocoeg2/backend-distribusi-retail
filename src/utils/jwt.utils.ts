import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { redisClient as redis } from '@/config/redis';
import { environment } from '@/config/environment';

const JWT_SECRET = environment.JWT_SECRET;
const JWT_EXPIRES_IN = environment.JWT_EXPIRES_IN;
const JWT_REFRESH_SECRET = environment.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = environment.JWT_REFRESH_EXPIRES_IN;

export const signToken = (payload: object, secret: string, options: jwt.SignOptions) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string, secret: string = JWT_SECRET) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, expired: false, decoded };
  } catch (e: any) {
    return {
      valid: false,
      expired: e.name === 'TokenExpiredError',
      decoded: null,
    };
  }
};

export const signAccessToken = async (user: User) => {
  const accessToken = signToken({ sub: user.id }, JWT_SECRET, { expiresIn: Number(JWT_EXPIRES_IN) });
  await redis.set(`user:${user.id}:accessToken`, accessToken, { EX: Number(JWT_EXPIRES_IN) });

  return accessToken;
};

export const signRefreshToken = async (user: User) => {
  const refreshToken = signToken({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: Number(JWT_REFRESH_EXPIRES_IN) });
  await redis.set(`user:${user.id}:refreshToken`, refreshToken, { EX: Number(JWT_REFRESH_EXPIRES_IN) });
  return refreshToken;
};
