import { User } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateUserInput, LoginInput } from '@/schemas/auth.schema';
import { AppError } from '@/utils/app-error';
import { comparePassword, hashPassword } from '@/utils/password.utils';
import { signTokens } from '@/utils/jwt.utils';
import { redisClient as redis } from '@/config/redis';
import { CacheService } from '@/services/cache.service';

export class AuthService {
  static async register(input: CreateUserInput): Promise<Omit<User, 'password'>> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        password: hashedPassword,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(
    input: LoginInput
  ): Promise<{ accessToken: string; refreshToken: string; user: Omit<User, 'password'> }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !(await comparePassword(input.password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = await signTokens(user);
    await CacheService.set(`user:${user.id}`, user, 3600);

    const { password, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }

  static async logout(userId: string): Promise<void> {
    await redis.del(`user:${userId}:accessToken`);
    await redis.del(`user:${userId}:refreshToken`);
    await CacheService.del(`user:${userId}`);
  }
}