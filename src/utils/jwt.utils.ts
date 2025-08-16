import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { prisma } from '../config/database';
import { environment } from '../config/environment';

const JWT_SECRET = environment.JWT_SECRET;
const JWT_EXPIRES_IN = environment.JWT_EXPIRES_IN;
const JWT_REFRESH_SECRET = environment.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = environment.JWT_REFRESH_EXPIRES_IN;

export const signToken = (payload: object, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string, secret: string = JWT_SECRET): any => {
  return jwt.verify(token, secret);
};

export const signTokens = async (user: User) => {
  const accessToken = signToken({ sub: user.id }, JWT_SECRET, JWT_EXPIRES_IN);
  const refreshToken = signToken({ sub: user.id }, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN);

  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
    },
  });

  return { accessToken, refreshToken };
};