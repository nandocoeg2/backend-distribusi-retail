import { FastifyRequest, FastifyReply } from 'fastify';
import { PurchaseOrderController } from '@/controllers/purchase-order.controller';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput, HistoryPurchaseOrderInput } from '@/schemas/purchase-order.schema';
import { ResponseUtil } from '@/utils/response.util';

jest.mock('@/services/purchase-order.service');

describe('PurchaseOrderController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', iat: 1, exp: 1 },
      isMultipart: jest.fn().mockReturnValue(true),
      parts: jest.fn().mockImplementation(async function* () {
        // Mock implementation for parts generator
        yield { type: 'field', fieldname: 'customerId', value: 'cust1' };
        yield { type: 'field', fieldname: 'po_number', value: 'PO123' };
        yield { type: 'field', fieldname: 'total_items', value: '1' };
        yield { type: 'field', fieldname: 'tanggal_order', value: new Date().toISOString() };
        yield { type: 'field', fieldname: 'po_type', value: 'SINGLE' };
        yield { type: 'field', fieldname: 'statusId', value: 'status1' };
      }),
    };
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPurchaseOrder', () => {
    it('should create a purchase order and return 201', async () => {
      const createInput: CreatePurchaseOrderInput = { customerId: 'cust1', po_number: 'PO123', total_items: 1, tanggal_order: new Date(), po_type: 'SINGLE', statusId: 'status1' };
      const po = { id: '1', ...createInput, createdAt: new Date(), updatedAt: new Date() };
      (PurchaseOrderService.createPurchaseOrder as jest.Mock).mockResolvedValue(po);

      await PurchaseOrderController.createPurchaseOrder(request as FastifyRequest, reply as FastifyReply);

      expect(PurchaseOrderService.createPurchaseOrder).toHaveBeenCalled();
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(po));
    });

    it('should create a purchase order with system user if no user is authenticated', async () => {
      const createInput: CreatePurchaseOrderInput = { customerId: 'cust1', po_number: 'PO123', total_items: 1, tanggal_order: new Date(), po_type: 'SINGLE', statusId: 'status1' };
      const po = { id: '1', ...createInput };
      (PurchaseOrderService.createPurchaseOrder as jest.Mock).mockResolvedValue(po);
      request.user = undefined;

      await PurchaseOrderController.createPurchaseOrder(request as FastifyRequest, reply as FastifyReply);

      expect(PurchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(expect.any(Object), expect.any(Array), 'system');
      expect(reply.code).toHaveBeenCalledWith(201);
    });

    it('should throw error if request is not multipart', async () => {
      request.isMultipart = jest.fn().mockReturnValue(false);
      await expect(PurchaseOrderController.createPurchaseOrder(request as FastifyRequest, reply as FastifyReply)).rejects.toThrow('Request is not multipart');
    });
  });

  describe('getPurchaseOrders', () => {
    it('should return all purchase orders with pagination', async () => {
      const paginatedResult = {
        data: [{ id: '1', customerId: 'cust1', po_number: 'PO123' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        }
      };
      request.query = { page: 1, limit: 10 };
      (PurchaseOrderService.getAllPurchaseOrders as jest.Mock).mockResolvedValue(paginatedResult);

      await PurchaseOrderController.getPurchaseOrders(request as FastifyRequest, reply as FastifyReply);

      expect(PurchaseOrderService.getAllPurchaseOrders).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(paginatedResult));
    });

    it('should use default pagination when not provided', async () => {
      const paginatedResult = {
        data: [{ id: '1', customerId: 'cust1', po_number: 'PO123' }],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 }
      };
      request.query = {};
      (PurchaseOrderService.getAllPurchaseOrders as jest.Mock).mockResolvedValue(paginatedResult);

      await PurchaseOrderController.getPurchaseOrders(request as FastifyRequest, reply as FastifyReply);

      expect(PurchaseOrderService.getAllPurchaseOrders).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getPurchaseOrder', () => {
    it('should return a single purchase order by id', async () => {
      const po = { id: '1', customerId: 'cust1', po_number: 'PO123' };
      request.params = { id: '1' };
      (PurchaseOrderService.getPurchaseOrderById as jest.Mock).mockResolvedValue(po);

      await PurchaseOrderController.getPurchaseOrder(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(PurchaseOrderService.getPurchaseOrderById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(po));
    });

    it('should return success with null if purchase order not found', async () => {
      request.params = { id: '1' };
      (PurchaseOrderService.getPurchaseOrderById as jest.Mock).mockResolvedValue(null);

      await PurchaseOrderController.getPurchaseOrder(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(PurchaseOrderService.getPurchaseOrderById).toHaveBeenCalledWith('1');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(null));
    });
  });

  describe('updatePurchaseOrder', () => {
    it('should update a purchase order and return it', async () => {
      const updateInput: UpdatePurchaseOrderInput['body'] = { po_number: 'PO456' };
      const po = { id: '1', customerId: 'cust1', po_number: 'PO456' };
      request.params = { id: '1' };
      request.body = updateInput;
      (PurchaseOrderService.updatePurchaseOrder as jest.Mock).mockResolvedValue(po);

      await PurchaseOrderController.updatePurchaseOrder(request as FastifyRequest<{ Params: { id: string }; Body: UpdatePurchaseOrderInput['body'] }>, reply as FastifyReply);

      expect(PurchaseOrderService.updatePurchaseOrder).toHaveBeenCalledWith('1', updateInput, 'user123');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(po));
    });

    it('should return success with null if purchase order to update not found', async () => {
      const updateInput: UpdatePurchaseOrderInput['body'] = { po_number: 'PO456' };
      request.params = { id: '1' };
      request.body = updateInput;
      (PurchaseOrderService.updatePurchaseOrder as jest.Mock).mockResolvedValue(null);

      await PurchaseOrderController.updatePurchaseOrder(request as FastifyRequest<{ Params: { id: string }; Body: UpdatePurchaseOrderInput['body'] }>, reply as FastifyReply);

      expect(PurchaseOrderService.updatePurchaseOrder).toHaveBeenCalledWith('1', updateInput, 'user123');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(null));
    });
  });

  describe('deletePurchaseOrder', () => {
    it('should delete a purchase order and return 204', async () => {
      request.params = { id: '1' };
      (PurchaseOrderService.deletePurchaseOrder as jest.Mock).mockResolvedValue({});

      await PurchaseOrderController.deletePurchaseOrder(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(PurchaseOrderService.deletePurchaseOrder).toHaveBeenCalledWith('1', 'user123');
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });

    it('should return 204 even if purchase order to delete is not found', async () => {
      request.params = { id: '1' };
      (PurchaseOrderService.deletePurchaseOrder as jest.Mock).mockResolvedValue(null);

      await PurchaseOrderController.deletePurchaseOrder(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(PurchaseOrderService.deletePurchaseOrder).toHaveBeenCalledWith('1', 'user123');
      expect(reply.code).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalled();
    });

    it('should delete a purchase order with system user if no user is authenticated', async () => {
      request.params = { id: '1' };
      request.user = undefined;
      (PurchaseOrderService.deletePurchaseOrder as jest.Mock).mockResolvedValue({});

      await PurchaseOrderController.deletePurchaseOrder(request as FastifyRequest<{ Params: { id: string } }>, reply as FastifyReply);

      expect(PurchaseOrderService.deletePurchaseOrder).toHaveBeenCalledWith('1', 'system');
      expect(reply.code).toHaveBeenCalledWith(204);
    });
  });

  describe('getHistoryPurchaseOrders', () => {
    it('should call PurchaseOrderService.getHistoryPurchaseOrders and return result', async () => {
      const mockResult = {
        data: [],
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10 }
      };
      (PurchaseOrderService.getHistoryPurchaseOrders as jest.Mock).mockResolvedValue(mockResult);

      request.query = { page: 1, limit: 10 };

      await PurchaseOrderController.getHistoryPurchaseOrders(
        request as FastifyRequest<{ Querystring: any }>,
        reply as FastifyReply
      );

      expect(PurchaseOrderService.getHistoryPurchaseOrders).toHaveBeenCalledWith(1, 10);
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(mockResult));
    });

    it('should use default pagination when not provided', async () => {
      const mockResult = {
        data: [],
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10 }
      };
      (PurchaseOrderService.getHistoryPurchaseOrders as jest.Mock).mockResolvedValue(mockResult);
      request.query = {};

      await PurchaseOrderController.getHistoryPurchaseOrders(
        request as FastifyRequest<{ Querystring: any }>,
        reply as FastifyReply
      );

      expect(PurchaseOrderService.getHistoryPurchaseOrders).toHaveBeenCalledWith(1, 10);
    });
  });
});
