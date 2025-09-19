import { User, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { CacheService } from '@/services/cache.service';
import { AppError } from '@/utils/app-error';
import { CreateUserInput, UpdateUserInput } from '@/schemas/user.schema';
import { PaginatedResult } from '@/types/common.types';
import { createAuditLog } from './audit.service';
import bcrypt from 'bcrypt';

export class UserService {
  static async createUser(data: CreateUserInput, userId: string): Promise<Omit<User, 'password'>> {
    try {
      const { password, ...userData } = data;
      
      // Cek apakah email sudah ada
      const existingEmail = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      
      if (existingEmail) {
        throw new AppError('User dengan email ini sudah ada', 409);
      }
      
      // Cek apakah username sudah ada
      const existingUsername = await prisma.user.findUnique({
        where: { username: userData.username },
      });
      
      if (existingUsername) {
        throw new AppError('User dengan username ini sudah ada', 409);
      }
      
      // Cek apakah role ada
      const role = await prisma.role.findUnique({
        where: { id: userData.roleId },
      });
      
      if (!role) {
        throw new AppError('Role tidak ditemukan', 404);
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
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

      await createAuditLog('User', user.id, 'CREATE', userId, user);
      
      // Clear cache
      await CacheService.del('users:all');
      
      return user;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new AppError('User dengan email ini sudah ada', 409);
        }
        if (error.meta?.target?.includes('username')) {
          throw new AppError('User dengan username ini sudah ada', 409);
        }
      }
      if (error.code === 'P2003') {
        throw new AppError('Role tidak ditemukan', 404);
      }
      throw new AppError('Error creating user', 500);
    }
  }

  static async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedResult<Omit<User, 'password'>>> {
    const skip = (page - 1) * limit;
    
    const [data, totalItems] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: parseInt(limit.toString()),
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  static async getUserById(id: string): Promise<Omit<User, 'password'>> {
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
      throw new AppError('User not found', 404);
    }

    await CacheService.set(`user:${id}`, user, 3600);

    return user;
  }

  static async updateUser(id: string, data: UpdateUserInput, userId: string): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });
      
      if (!existingUser) {
        throw new AppError('User tidak ditemukan', 404);
      }
      
      const { password, ...userData } = data;
      
      // Cek duplikasi email jika diupdate
      if (userData.email && userData.email !== existingUser.email) {
        const duplicateEmail = await prisma.user.findUnique({
          where: { email: userData.email },
        });
        
        if (duplicateEmail) {
          throw new AppError('User dengan email ini sudah ada', 409);
        }
      }
      
      // Cek duplikasi username jika diupdate
      if (userData.username && userData.username !== existingUser.username) {
        const duplicateUsername = await prisma.user.findUnique({
          where: { username: userData.username },
        });
        
        if (duplicateUsername) {
          throw new AppError('User dengan username ini sudah ada', 409);
        }
      }
      
      // Cek apakah role ada jika diupdate
      if (userData.roleId && userData.roleId !== existingUser.roleId) {
        const role = await prisma.role.findUnique({
          where: { id: userData.roleId },
        });
        
        if (!role) {
          throw new AppError('Role tidak ditemukan', 404);
        }
      }
      
      // Hash password jika diupdate
      let updateData: any = { ...userData };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
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

      await createAuditLog('User', updatedUser.id, 'UPDATE', userId, {
        before: existingUser,
        after: updatedUser,
      });
      
      // Clear cache
      await CacheService.del(`user:${id}`);
      await CacheService.del('users:all');
      
      return updatedUser;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new AppError('User dengan email ini sudah ada', 409);
        }
        if (error.meta?.target?.includes('username')) {
          throw new AppError('User dengan username ini sudah ada', 409);
        }
      }
      if (error.code === 'P2003') {
        throw new AppError('Role tidak ditemukan', 404);
      }
      if (error.code === 'P2025') {
        throw new AppError('User tidak ditemukan', 404);
      }
      throw new AppError('Error updating user', 500);
    }
  }

  static async deleteUser(id: string, userId: string): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await prisma.user.findUnique({
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
      
      if (!existingUser) {
        throw new AppError('User tidak ditemukan', 404);
      }
      
      await createAuditLog('User', id, 'DELETE', userId, existingUser);
      
      const deletedUser = await prisma.user.delete({
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
      
      // Clear cache
      await CacheService.del(`user:${id}`);
      await CacheService.del('users:all');
      
      return deletedUser;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new AppError('User tidak ditemukan', 404);
      }
      throw new AppError('Error deleting user', 500);
    }
  }

  static async searchUsers(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Omit<User, 'password'>>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      return this.getAllUsers(page, limit);
    }

    const filters: Prisma.UserWhereInput[] = [
      {
        email: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        firstName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        lastName: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    const [data, totalItems] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: {
          OR: filters,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }
}