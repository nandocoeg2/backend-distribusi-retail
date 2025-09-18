import { SupplierService } from '@/services/supplier.service';
import { prisma } from '@/config/database';
import { CreateSupplierInput, UpdateSupplierInput } from '@/schemas/supplier.schema';
import { AppError } from '@/utils/app-error';

// Mock audit service
jest.mock('@/services/audit.service', () => ({
  createAuditLog: jest.fn(),
}));

// Mock Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    supplier: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    auditTrail: {
      findMany: jest.fn(),
    },
  },
}));

describe('SupplierService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSupplier', () => {
    it('should create a new supplier', async () => {
      const input: CreateSupplierInput = {
        name: 'Supplier A',
        code: 'SUP001',
        address: '456 Corp Ave',
        phoneNumber: '1122334455',
        email: 'contact@suppliera.com',
        bank: {
          name: 'Test Bank',
          account: '1234567890',
          holder: 'Supplier A'
        }
      };
      const expectedSupplier = { id: '1', ...input, createdAt: new Date(), updatedAt: new Date() };

      (prisma.supplier.create as jest.Mock).mockResolvedValue(expectedSupplier);

      const result = await SupplierService.createSupplier(input, 'user123');

      expect(prisma.supplier.create).toHaveBeenCalledWith({
        data: {
          ...input,
          createdBy: 'user123',
          updatedBy: 'user123',
        }
      });
      expect(result).toEqual(expectedSupplier);
    });

    it('should throw an error if supplier with code already exists', async () => {
        const input: CreateSupplierInput = {
            name: 'Supplier A',
            code: 'SUP001',
            address: '456 Corp Ave',
            phoneNumber: '1122334455',
            email: 'contact@suppliera.com',
        };
        (prisma.supplier.create as jest.Mock).mockRejectedValue({ code: 'P2002', meta: { target: ['code'] } });

        await expect(SupplierService.createSupplier(input, 'user123')).rejects.toThrow(
            new AppError('Supplier with this code already exists', 409)
        );
    });
  });

  describe('getAllSuppliers', () => {
    it('should return all suppliers with pagination', async () => {
      const expectedSuppliers = [
        { id: '1', name: 'Supplier A', code: 'SUP001', email: 'contact@suppliera.com', address: '456 Corp Ave', phoneNumber: '1122334455', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Supplier B', code: 'SUP002', email: 'contact@supplierb.com', address: '789 Business Rd', phoneNumber: '5544332211', createdAt: new Date(), updatedAt: new Date() },
      ];
      const paginatedResult = {
        data: expectedSuppliers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
        }
      };

      (prisma.supplier.findMany as jest.Mock).mockResolvedValue(expectedSuppliers);
      (prisma.supplier.count as jest.Mock).mockResolvedValue(2);

      const result = await SupplierService.getAllSuppliers(1, 10);

      expect(prisma.supplier.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(prisma.supplier.count).toHaveBeenCalled();
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('getSupplierById', () => {
    it('should return a supplier by id', async () => {
      const supplierId = '1';
      const expectedSupplier = { id: supplierId, name: 'Supplier A', code: 'SUP001', email: 'contact@suppliera.com', address: '456 Corp Ave', phoneNumber: '1122334455', createdAt: new Date(), updatedAt: new Date() };
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(expectedSupplier);
      (prisma.auditTrail.findMany as jest.Mock).mockResolvedValue([]);


      const result = await SupplierService.getSupplierById(supplierId);

      expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
        where: { id: supplierId },
        include: {
          purchaseOrders: {
            include: {
              purchaseOrderDetails: true,
            },
          },
        },
      });
      expect(result).toEqual({ ...expectedSupplier, auditTrails: [] });
    });

    it('should throw an error if supplier not found', async () => {
      const supplierId = '999';
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(SupplierService.getSupplierById(supplierId)).rejects.toThrow(
        new AppError('Supplier not found', 404)
      );
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier', async () => {
      const supplierId = '1';
      const input: UpdateSupplierInput['body'] = {
        name: 'Supplier A Updated',
      };
      const expectedSupplier = { id: supplierId, name: 'Supplier A Updated', code: 'SUP001', email: 'contact@suppliera.com', address: '456 Corp Ave', phoneNumber: '1122334455', createdAt: new Date(), updatedAt: new Date() };

      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (prisma.supplier.update as jest.Mock).mockResolvedValue(expectedSupplier);

      const result = await SupplierService.updateSupplier(supplierId, input, 'user123');

      expect(prisma.supplier.update).toHaveBeenCalledWith({
        where: { id: supplierId },
        data: {
          ...input,
          updatedBy: 'user123',
        }
      });
      expect(result).toEqual(expectedSupplier);
    });

    it('should throw an error if supplier to update is not found', async () => {
      const supplierId = '999';
      const input: UpdateSupplierInput['body'] = { name: 'Non Existent' };
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(SupplierService.updateSupplier(supplierId, input, 'user123')).rejects.toThrow(
        'Supplier not found'
      );
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier', async () => {
      const supplierId = '1';
      const expectedSupplier = { id: supplierId, name: 'Supplier A', code: 'SUP001', email: 'contact@suppliera.com', address: '456 Corp Ave', phoneNumber: '1122334455', createdAt: new Date(), updatedAt: new Date() };
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(expectedSupplier);
      (prisma.supplier.delete as jest.Mock).mockResolvedValue(expectedSupplier);

      const result = await SupplierService.deleteSupplier(supplierId, 'user123');

      expect(prisma.supplier.delete).toHaveBeenCalledWith({ where: { id: supplierId } });
      expect(result).toEqual(expectedSupplier);
    });

    it('should throw an error if supplier to delete is not found', async () => {
      const supplierId = '999';
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(SupplierService.deleteSupplier(supplierId, 'user123')).rejects.toThrow(
        'Supplier not found'
      );
    });
  });

  describe('searchSuppliers', () => {
    it('should return suppliers matching the query with pagination', async () => {
        const query = 'Supplier A';
        const expectedSuppliers = [
            { id: '1', name: 'Supplier A', code: 'SUP001', email: 'contact@suppliera.com', address: '456 Corp Ave', phoneNumber: '1122334455', createdAt: new Date(), updatedAt: new Date() },
        ];
        const paginatedResult = {
            data: expectedSuppliers,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
                itemsPerPage: 10,
            }
        };

        (prisma.supplier.findMany as jest.Mock).mockResolvedValue(expectedSuppliers);
        (prisma.supplier.count as jest.Mock).mockResolvedValue(1);

        const result = await SupplierService.searchSuppliers(query, 1, 10);

        expect(prisma.supplier.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { address: { contains: query, mode: 'insensitive' } },
                    { phoneNumber: { contains: query, mode: 'insensitive' } },
                    { code: { contains: query, mode: 'insensitive' } },
                ],
            },
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: 'desc',
            },
        });
        expect(prisma.supplier.count).toHaveBeenCalledWith({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { address: { contains: query, mode: 'insensitive' } },
                    { phoneNumber: { contains: query, mode: 'insensitive' } },
                    { code: { contains: query, mode: 'insensitive' } },
                ],
            },
        });
        expect(result).toEqual(paginatedResult);
    });
  });
});
