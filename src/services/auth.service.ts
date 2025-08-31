import { User } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateUserInput, LoginInput } from '@/schemas/auth.schema';
import { AppError } from '@/utils/app-error';
import { comparePassword, hashPassword } from '@/utils/password.utils';
import { signAccessToken } from '@/utils/jwt.utils';
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

    const userRole = await prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new AppError('Default role not found', 500);
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        password: hashedPassword,
        role: {
          connect: {
            id: userRole.id,
          },
        },
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(
    input: LoginInput
  ): Promise<{ user: any }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        role: {
          include: {
                menus: {
                  include: {
                    menu: true,
                  },
                  orderBy: {
                    menu: {
                      id: 'asc',
                    },
                  },
                },
              },
        },
      },
    });

    if (!user || !(await comparePassword(input.password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = await signAccessToken(user);

    const accessibleMenus = user.role ? user.role.menus.map(rm => rm.menu) : [];

    accessibleMenus.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA === orderB) {
        return a.id.localeCompare(b.id);
      }
      return orderA - orderB;
    });

    const parentMenus = accessibleMenus.filter(menu => !menu.parentId);
    const hierarchicalMenus = parentMenus.map(parent => ({
      ...parent,
      children: accessibleMenus.filter(child => child.parentId === parent.id),
    }));

    const { password, role, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      role: role ? { id: role.id, name: role.name } : null,
      menus: hierarchicalMenus,
    };

    await CacheService.set(`user:${user.id}`, userResponse, 3600);

    return { user: { ...userResponse, accessToken } };
  }

  static async logout(userId: string): Promise<void> {
    await redis.del(`user:${userId}:accessToken`);
    await CacheService.del(`user:${userId}`);
  }
}
