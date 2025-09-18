import { GroupCustomer, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateGroupCustomerInput, UpdateGroupCustomerInput } from '@/schemas/group-customer.schema';
import { AppError } from '../utils/app-error';
import { PaginatedResult } from './purchase-order.service';
import { createAuditLog } from './audit.service';

export class GroupCustomerService {
  static async createGroupCustomer(data: CreateGroupCustomerInput, userId: string): Promise<GroupCustomer> {
    try {
      const { createdBy, updatedBy, ...groupCustomerData } = data;
      
      const groupCustomer = await prisma.groupCustomer.create({
        data: {
          ...groupCustomerData,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      await createAuditLog('GroupCustomer', groupCustomer.id, 'CREATE', userId, groupCustomer);
      
      return groupCustomer;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('kode_group')) {
        throw new AppError('GroupCustomer with this code already exists', 409);
      }
      throw error;
    }
  }

  static async getAllGroupCustomers(page: number = 1, limit: number = 10): Promise<PaginatedResult<GroupCustomer>> {
    const skip = (page - 1) * limit;
    
    const [data, totalItems] = await Promise.all([
      prisma.groupCustomer.findMany({
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.groupCustomer.count(),
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

  static async getGroupCustomerById(id: string) {
    const groupCustomer = await prisma.groupCustomer.findUnique({
      where: { id },
    });

    if (!groupCustomer) {
      throw new AppError('GroupCustomer not found', 404);
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'GroupCustomer',
        recordId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return {
      ...groupCustomer,
      auditTrails,
    };
  }

  static async updateGroupCustomer(id: string, data: UpdateGroupCustomerInput['body'], userId: string): Promise<GroupCustomer> {
    const existingGroupCustomer = await prisma.groupCustomer.findUnique({
      where: { id },
    });

    if (!existingGroupCustomer) {
      throw new AppError('GroupCustomer not found', 404);
    }

    const { updatedBy, ...groupCustomerData } = data;

    const updatedGroupCustomer = await prisma.groupCustomer.update({
      where: { id },
      data: {
        ...groupCustomerData,
        updatedBy: userId,
      },
    });

    await createAuditLog('GroupCustomer', updatedGroupCustomer.id, 'UPDATE', userId, {
      before: existingGroupCustomer,
      after: updatedGroupCustomer,
    });

    return updatedGroupCustomer;
  }

  static async deleteGroupCustomer(id: string, userId: string): Promise<GroupCustomer> {
    const existingGroupCustomer = await prisma.groupCustomer.findUnique({
      where: { id },
    });

    if (!existingGroupCustomer) {
      throw new AppError('GroupCustomer not found', 404);
    }

    await createAuditLog('GroupCustomer', id, 'DELETE', userId, existingGroupCustomer);

    return await prisma.groupCustomer.delete({
      where: { id },
    });
  }

  static async searchGroupCustomers(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<GroupCustomer>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      return this.getAllGroupCustomers(page, limit);
    }

    const filters: Prisma.GroupCustomerWhereInput[] = [
      {
        kode_group: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        nama_group: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        alamat: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        npwp: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    const [data, totalItems] = await Promise.all([
      prisma.groupCustomer.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.groupCustomer.count({
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
