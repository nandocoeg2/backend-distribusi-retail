import { PackingController } from '@/controllers/packing.controller';
import { PackingService } from '@/services/packing.service';

// Mock PackingService
jest.mock('@/services/packing.service');

describe('PackingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
