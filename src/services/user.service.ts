import { User } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/app-error';
import { CacheService } from './cache.service';

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
        name: true,
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
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      await CacheService.set(`user:${id}`, user, 3600);
    }

    return user;
  }
}