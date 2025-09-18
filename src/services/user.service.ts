import { User } from '@prisma/client';
import { prisma } from '@/config/database';
import { CacheService } from '@/services/cache.service';

export class UserService {
  static async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const cachedUsers = await CacheService.get<Omit<User, 'password'>[]>('users:all');
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        roleId: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await CacheService.set('users:all', users, 600);
    return users;
  }

  static async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const cachedUser = await CacheService.get<Omit<User, 'password'>>(`user:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        roleId: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // Throw an error instead of returning null to be consistent with other services
      throw new AppError('User not found', 404);
    }

    await CacheService.set(`user:${id}`, user, 3600);

    return user;
  }
}