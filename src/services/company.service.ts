import { Company, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateCompanyInput, UpdateCompanyInput } from '../schemas/company.schema';
import { AppError } from '../utils/app-error';
import { PaginatedResult } from './purchase-order.service';
import { createAuditLog } from './audit.service';

export class CompanyService {
  static async createCompany(data: CreateCompanyInput, userId: string): Promise<Company> {
    try {
      const { createdBy, updatedBy, ...companyData } = data;
      
      const company = await prisma.company.create({
        data: {
          ...companyData,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      await createAuditLog('Company', company.id, 'CREATE', userId, company);
      
      return company;
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('kode_company')) {
        throw new AppError('Company with this code already exists', 409);
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new AppError('Company with this email already exists', 409);
      }
      throw error;
    }
  }

  static async getAllCompanies(page: number = 1, limit: number = 10): Promise<PaginatedResult<Company>> {
    const skip = (page - 1) * limit;
    
    const [data, totalItems] = await Promise.all([
      prisma.company.findMany({
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.company.count(),
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

  static async getCompanyById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return null;
    }

    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        tableName: 'Company',
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
      ...company,
      auditTrails,
    };
  }

  static async updateCompany(id: string, data: UpdateCompanyInput['body'], userId: string): Promise<Company | null> {
    try {
      const existingCompany = await prisma.company.findUnique({
        where: { id },
      });

      if (!existingCompany) {
        return null;
      }

      const { updatedBy, ...companyData } = data;
      
      const updatedCompany = await prisma.company.update({
        where: { id },
        data: {
          ...companyData,
          updatedBy: userId,
        },
      });

      await createAuditLog('Company', updatedCompany.id, 'UPDATE', userId, {
        before: existingCompany,
        after: updatedCompany,
      });
      
      return updatedCompany;
    } catch (error) {
      return null;
    }
  }

  static async deleteCompany(id: string, userId: string): Promise<Company | null> {
    try {
      const existingCompany = await prisma.company.findUnique({
        where: { id },
      });

      if (!existingCompany) {
        return null;
      }

      await createAuditLog('Company', id, 'DELETE', userId, existingCompany);
      
      return await prisma.company.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }

  static async searchCompanies(query?: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Company>> {
    const skip = (page - 1) * limit;
    
    if (!query) {
      const [data, totalItems] = await Promise.all([
        prisma.company.findMany({
          skip,
          take: parseInt(limit.toString()),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.company.count(),
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

    const filters: Prisma.CompanyWhereInput[] = [
      {
        kode_company: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        nama_perusahaan: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        telp: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];

    const [data, totalItems] = await Promise.all([
      prisma.company.findMany({
        where: {
          OR: filters,
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.company.count({
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

