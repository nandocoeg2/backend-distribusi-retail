import { User, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { CacheService } from '@/services/cache.service';
import { AppError } from '@/utils/app-error';
import { CreateUserInput, UpdateUserInput } from '@/schemas/user.schema';
import { PaginatedResult } from '@/types/common.types';
import { createAuditLog } from './audit.service';
import { calculatePagination, executePaginatedQuery } from '@/utils/pagination.utils';
import bcrypt from 'bcrypt';

export class UserService {
  private static async getActorAudits(userId: string, take: number) {
    return prisma.auditTrail.findMany({
      where: { tableName: 'User', userId },
      take,
      orderBy: { timestamp: 'desc' as Prisma.SortOrder },
      select: {
        id: true,
        tableName: true,
        recordId: true,
        action: true,
        timestamp: true,
        details: true,
        userId: true,
      },
    });
  }

  private static baseUserSelect = {
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
  };

  private static async withAudits<T extends { id: string }>(entity: T, take: number) {
    const auditTrails = await this.getActorAudits(entity.id, take);
    return { ...entity, auditTrails } as any;
  }
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
        select: UserService.baseUserSelect,
      });

      await createAuditLog('User', user.id, 'CREATE', userId, user);
      
      // Clear cache
      await CacheService.del('users:all');

      return this.withAudits(user, 3);
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
    const { skip, take } = calculatePagination(page, limit);
    
    const userSelect = UserService.baseUserSelect;
    
    const dataQuery = prisma.user.findMany({
      skip,
      take,
      select: userSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const countQuery = prisma.user.count();

    const pageResult = await executePaginatedQuery(dataQuery, countQuery, page, limit);
    const dataWithAudits = await Promise.all(
      pageResult.data.map((u: any) => this.withAudits(u, 3))
    );
    return { ...pageResult, data: dataWithAudits } as any;
  }

  static async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const cachedUser = await CacheService.get<any>(`user:${id}`);
    if (cachedUser && typeof cachedUser === 'object' && Array.isArray(cachedUser.auditTrails)) {
      const hasAudits = cachedUser.auditTrails.length > 0;
      const isValidAudit = cachedUser.auditTrails.every(
        (a: any) => a?.tableName === 'User' && a?.userId === id
      );
      if (hasAudits && isValidAudit) {
        return cachedUser as Omit<User, 'password'>;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: UserService.baseUserSelect,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const result: any = await this.withAudits(user, 10);
    await CacheService.set(`user:${id}`, result, 3600);

    return result;
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
        select: UserService.baseUserSelect,
      });

      await createAuditLog('User', updatedUser.id, 'UPDATE', userId, {
        before: existingUser,
        after: updatedUser,
      });
      
      // Clear cache
      await CacheService.del(`user:${id}`);
      await CacheService.del('users:all');
      
      return this.withAudits(updatedUser, 3);
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
        select: UserService.baseUserSelect,
      });
      
      if (!existingUser) {
        throw new AppError('User tidak ditemukan', 404);
      }
      
      await createAuditLog('User', id, 'DELETE', userId, existingUser);
      
      const deletedUser = await prisma.user.delete({
        where: { id },
        select: UserService.baseUserSelect,
      });
      
      // Clear cache
      await CacheService.del(`user:${id}`);
      await CacheService.del('users:all');
      
      return this.withAudits(deletedUser, 3);
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
    if (!query) {
      return this.getAllUsers(page, limit);
    }

    const { skip, take } = calculatePagination(page, limit);
    
    const userSelect = UserService.baseUserSelect;

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
      // Cari berdasarkan nama role
      {
        role: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
    ];

    // Tambahkan filter status berdasarkan kata kunci umum (aktif/nonaktif)
    const normalized = query.trim().toLowerCase();
    const activeKeywords = ['active', 'aktif', 'enabled', 'true', '1', 'ya', 'yes'];
    const inactiveKeywords = ['inactive', 'nonaktif', 'disabled', 'false', '0', 'tidak', 'no'];

    if (activeKeywords.includes(normalized)) {
      filters.push({ isActive: true });
    } else if (inactiveKeywords.includes(normalized)) {
      filters.push({ isActive: false });
    }

    const whereClause = { OR: filters };

    const dataQuery = prisma.user.findMany({
      where: whereClause,
      skip,
      take,
      select: userSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const countQuery = prisma.user.count({
      where: whereClause,
    });

    const pageResult = await executePaginatedQuery(dataQuery, countQuery, page, limit);
    const dataWithAudits = await Promise.all(
      pageResult.data.map((u: any) => this.withAudits(u, 3))
    );
    return { ...pageResult, data: dataWithAudits } as any;
  }
}