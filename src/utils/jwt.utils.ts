import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { redisClient as redis } from '@/config/redis';
import { environment } from '@/config/environment';

const JWT_SECRET = environment.JWT_SECRET;
const JWT_EXPIRES_IN = environment.JWT_EXPIRES_IN;
const JWT_REFRESH_SECRET = environment.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = environment.JWT_REFRESH_EXPIRES_IN;

export const signToken = (payload: object, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn: parseInt(expiresIn, 10) });
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

export const signTokens = async (user: User) => {
  const accessToken = signToken({ sub: user.id }, JWT_SECRET, JWT_EXPIRES_IN);
  const refreshToken = signToken({ sub: user.id }, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN);

  await redis.set(`user:${user.id}:accessToken`, accessToken, { EX: parseInt(JWT_EXPIRES_IN, 10) });
  await redis.set(`user:${user.id}:refreshToken`, refreshToken, { EX: parseInt(JWT_REFRESH_EXPIRES_IN, 10) });

  return { accessToken, refreshToken };
};

export const reissueAccessToken = async (refreshToken: string) => {
  const { decoded, expired } = verifyToken(refreshToken, JWT_REFRESH_SECRET);

  if (!decoded || !decoded.sub || expired) return false;

  const storedRefreshToken = await redis.get(`user:${decoded.sub}:refreshToken`);

  if (!storedRefreshToken || storedRefreshToken !== refreshToken) return false;

  const accessToken = signToken({ sub: decoded.sub }, JWT_SECRET, JWT_EXPIRES_IN);

  await redis.set(`user:${decoded.sub}:accessToken`, accessToken, { EX: parseInt(JWT_EXPIRES_IN, 10) });

  return accessToken;
};