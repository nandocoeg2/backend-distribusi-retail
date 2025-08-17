import { PurchaseOrderService } from '@/services/purchase-order.service';
import { prisma } from '@/config/database';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from '@/schemas/purchase-order.schema';

// Mock Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    purchaseOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('PurchaseOrderService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPurchaseOrder', () => {
    it('should create a new purchase order', async () => {
      const input: CreatePurchaseOrderInput = {
        customerId: 'cust1',
        orderNumber: 'PO123',
      };
      const expectedPO = { id: '1', ...input, createdAt: new Date(), updatedAt: new Date() };

      (prisma.purchaseOrder.create as jest.Mock).mockResolvedValue(expectedPO);

      const result = await PurchaseOrderService.createPurchaseOrder(input);

      expect(prisma.purchaseOrder.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(expectedPO);
    });
  });

  describe('getAllPurchaseOrders', () => {
    it('should return all purchase orders with relations', async () => {
      const expectedPOs = [
        {
          id: '1',
          customerId: 'cust1',
          orderNumber: 'PO123',
          createdAt: new Date(),
          updatedAt: new Date(),
          customer: { id: 'cust1', name: 'Test Customer' },
          files: [],
        },
      ];

      (prisma.purchaseOrder.findMany as jest.Mock).mockResolvedValue(expectedPOs);

      const result = await PurchaseOrderService.getAllPurchaseOrders();

      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith({
        include: {
          customer: true,
          files: true,
        },
      });
      expect(result).toEqual(expectedPOs);
    });
  });

  describe('getPurchaseOrderById', () => {
    it('should return a purchase order by id with relations', async () => {
      const poId = '1';
      const expectedPO = {
        id: poId,
        customerId: 'cust1',
        orderNumber: 'PO123',
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: { id: 'cust1', name: 'Test Customer' },
        files: [],
      };

      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(expectedPO);

      const result = await PurchaseOrderService.getPurchaseOrderById(poId);

      expect(prisma.purchaseOrder.findUnique).toHaveBeenCalledWith({
        where: { id: poId },
        include: {
          customer: true,
          files: true,
        },
      });
      expect(result).toEqual(expectedPO);
    });

     it('should return null if purchase order not found', async () => {
      const poId = '999';
      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await PurchaseOrderService.getPurchaseOrderById(poId);

      expect(result).toBeNull();
    });
  });

  describe('updatePurchaseOrder', () => {
    it('should update a purchase order', async () => {
      const poId = '1';
      const input: UpdatePurchaseOrderInput['body'] = {
        orderNumber: 'PO456',
      };
      const expectedPO = {
        id: poId,
        customerId: 'cust1',
        orderNumber: 'PO456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.purchaseOrder.update as jest.Mock).mockResolvedValue(expectedPO);

      const result = await PurchaseOrderService.updatePurchaseOrder(poId, input);

      expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({ where: { id: poId }, data: input });
      expect(result).toEqual(expectedPO);
    });

    it('should return null if purchase order to update is not found', async () => {
        const poId = '999';
        const input: UpdatePurchaseOrderInput['body'] = { orderNumber: 'PO456' };
  
        (prisma.purchaseOrder.update as jest.Mock).mockRejectedValue(new Error('Record not found'));
  
        const result = await PurchaseOrderService.updatePurchaseOrder(poId, input);
  
        expect(result).toBeNull();
      });
  });

  describe('deletePurchaseOrder', () => {
    it('should delete a purchase order', async () => {
      const poId = '1';
      const expectedPO = { id: poId, customerId: 'cust1', orderNumber: 'PO123', createdAt: new Date(), updatedAt: new Date() };

      (prisma.purchaseOrder.delete as jest.Mock).mockResolvedValue(expectedPO);

      const result = await PurchaseOrderService.deletePurchaseOrder(poId);

      expect(prisma.purchaseOrder.delete).toHaveBeenCalledWith({ where: { id: poId } });
      expect(result).toEqual(expectedPO);
    });

     it('should return null if purchase order to delete is not found', async () => {
        const poId = '999';
  
        (prisma.purchaseOrder.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));
  
        const result = await PurchaseOrderService.deletePurchaseOrder(poId);
  
        expect(result).toBeNull();
      });
  });
});

