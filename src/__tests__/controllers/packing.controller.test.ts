import { PackingController } from '@/controllers/packing.controller';
import { PackingService } from '@/services/packing.service';

// Mock PackingService
jest.mock('@/services/packing.service');

describe('PackingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPacking', () => {
    it('should create a packing successfully', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        packingItems: [],
      };

      const mockCreatedPacking = {
        id: 'packing1',
        ...mockPackingData,
        updatedBy: 'user1',
      };

      (PackingService.createPacking as jest.Mock).mockResolvedValue(mockCreatedPacking);

      const request: any = {
        body: mockPackingData,
        user: { sub: 'user1' },
      };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.createPacking(request, reply);

      expect(PackingService.createPacking).toHaveBeenCalledWith({
        ...mockPackingData,
        updatedBy: 'user1',
      });
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(mockCreatedPacking);
    });

    it('should use system as fallback when user is not available', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        packingItems: [],
      };

      const mockCreatedPacking = {
        id: 'packing1',
        ...mockPackingData,
        updatedBy: 'system',
      };

      (PackingService.createPacking as jest.Mock).mockResolvedValue(mockCreatedPacking);

      const request: any = {
        body: mockPackingData,
        user: null,
      };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.createPacking(request, reply);

      expect(PackingService.createPacking).toHaveBeenCalledWith({
        ...mockPackingData,
        updatedBy: 'system',
      });
    });

    it('should handle service errors', async () => {
      const mockPackingData = {
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        packingItems: [],
      };

      const error = new Error('Service error');
      (PackingService.createPacking as jest.Mock).mockRejectedValue(error);

      const request: any = {
        body: mockPackingData,
        user: { sub: 'user1' },
      };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await expect(PackingController.createPacking(request, reply)).rejects.toThrow(error);
    });
  });

  describe('getPackings', () => {
    it('should return paginated packings', async () => {
      const mockResult = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };

      (PackingService.getAllPackings as jest.Mock).mockResolvedValue(mockResult);

      const request: any = { query: { page: 1, limit: 10 } };
      const reply: any = {
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.getPackings(request, reply);

      expect(reply.send).toHaveBeenCalledWith(mockResult);
      expect(PackingService.getAllPackings).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getPacking', () => {
    it('should return a packing by id', async () => {
      const mockPacking = {
        id: 'packing1',
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
      };

      (PackingService.getPackingById as jest.Mock).mockResolvedValue(mockPacking);

      const request: any = { params: { id: 'packing1' } };
      const reply: any = {
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.getPacking(request, reply);

      expect(reply.send).toHaveBeenCalledWith(mockPacking);
      expect(PackingService.getPackingById).toHaveBeenCalledWith('packing1');
    });

    it('should return 404 if packing not found', async () => {
      (PackingService.getPackingById as jest.Mock).mockResolvedValue(null);

      const request: any = { params: { id: 'packing1' } };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.getPacking(request, reply);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Packing not found' });
    });
  });

  describe('updatePacking', () => {
    it('should update packing successfully', async () => {
      const mockUpdateData = {
        tanggal_packing: new Date(),
        statusId: 'status2',
      };

      const mockUpdatedPacking = {
        id: 'packing1',
        ...mockUpdateData,
        updatedBy: 'user1',
      };

      (PackingService.updatePacking as jest.Mock).mockResolvedValue(mockUpdatedPacking);

      const request: any = {
        params: { id: 'packing1' },
        body: mockUpdateData,
        user: { sub: 'user1' },
      };
      const reply: any = {
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.updatePacking(request, reply);

      expect(PackingService.updatePacking).toHaveBeenCalledWith('packing1', {
        ...mockUpdateData,
        updatedBy: 'user1',
      });
      expect(reply.send).toHaveBeenCalledWith(mockUpdatedPacking);
    });

    it('should return 404 if packing not found', async () => {
      const mockUpdateData = {
        tanggal_packing: new Date(),
        statusId: 'status2',
      };

      (PackingService.updatePacking as jest.Mock).mockResolvedValue(null);

      const request: any = {
        params: { id: 'packing1' },
        body: mockUpdateData,
        user: { sub: 'user1' },
      };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.updatePacking(request, reply);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Packing not found' });
    });

    it('should handle service errors', async () => {
      const mockUpdateData = {
        tanggal_packing: new Date(),
        statusId: 'status2',
      };

      const error = new Error('Service error');
      (PackingService.updatePacking as jest.Mock).mockRejectedValue(error);

      const request: any = {
        params: { id: 'packing1' },
        body: mockUpdateData,
        user: { sub: 'user1' },
      };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await expect(PackingController.updatePacking(request, reply)).rejects.toThrow(error);
    });
  });

  describe('deletePacking', () => {
    it('should delete packing successfully', async () => {
      const mockDeletedPacking = {
        id: 'packing1',
        tanggal_packing: new Date(),
        statusId: 'status1',
        purchaseOrderId: 'po1',
        updatedBy: 'user1',
      };

      (PackingService.deletePacking as jest.Mock).mockResolvedValue(mockDeletedPacking);

      const request: any = { params: { id: 'packing1' } };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.deletePacking(request, reply);

      expect(PackingService.deletePacking).toHaveBeenCalledWith('packing1');
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalledWith();
    });

    it('should return 404 if packing not found', async () => {
      (PackingService.deletePacking as jest.Mock).mockResolvedValue(null);

      const request: any = { params: { id: 'packing1' } };
      const reply: any = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.deletePacking(request, reply);

      expect(reply.code).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ message: 'Packing not found' });
    });
  });

  describe('searchPackings', () => {
    it('should search packings with query parameters', async () => {
      const mockQuery = {
        tanggal_packing: '2025-01-15',
        statusId: 'status1',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };

      (PackingService.searchPackings as jest.Mock).mockResolvedValue(mockResult);

      const request: any = { query: mockQuery };
      const reply: any = {
        send: jest.fn().mockReturnThis(),
      };

      await PackingController.searchPackings(request, reply);

      expect(PackingService.searchPackings).toHaveBeenCalledWith(mockQuery);
      expect(reply.send).toHaveBeenCalledWith(mockResult);
    });
  });
});
