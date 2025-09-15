import { PurchaseOrderService } from '@/services/purchase-order.service';
import { AppError } from '@/utils/app-error';

// Mock Prisma
jest.mock('@/config/database', () => ({
  prisma: {
    purchaseOrder: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    status: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    purchaseOrderDetail: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    inventory: {
      upsert: jest.fn(),
    },
    packing: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    invoice: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    suratJalan: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock utility functions
jest.mock('@/utils/random.utils', () => ({
  generatePackingNumber: jest.fn().mockReturnValue('PN-20250915-PO-001'),
  generateUniqueInvoiceNumber: jest.fn().mockResolvedValue('INV-2025-09-PO-001'),
  generateUniqueSuratJalanWithCreate: jest.fn().mockImplementation(async (poNumber, createFn) => {
    return await createFn('SJ-20250915-PO-001');
  }),
  generateSuratJalanNumber: jest.fn().mockReturnValue('SJ-20250915-PO-001'),
}));

// Import prisma after mocking
const { prisma } = require('@/config/database');

describe('PurchaseOrderService', () => {
  const mockPaginatedResult = {
    data: [
      {
        id: 'po1',
        po_number: 'PO-001',
        customer: { name: 'Test Customer' },
        supplier: { name: 'Test Supplier' },
        status: { name: 'PENDING' },
        tanggal_order: new Date(),
        files: [],
        purchaseOrderDetails: [],
        packings: [],
      },
    ],
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    jest.spyOn(prisma.status, 'findMany').mockResolvedValue([
      { id: 'status1', status_code: 'PENDING PURCHASE ORDER' },
      { id: 'status2', status_code: 'PROCESSED PURCHASE ORDER' },
      { id: 'status3', status_code: 'PROCESSING PURCHASE ORDER' },
    ] as any);
    jest.spyOn(prisma.purchaseOrder, 'findMany').mockResolvedValue(mockPaginatedResult.data as any);
    jest.spyOn(prisma.purchaseOrder, 'count').mockResolvedValue(mockPaginatedResult.pagination.totalItems);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllPurchaseOrders', () => {
    it('should return paginated purchase orders', async () => {
      const result = await PurchaseOrderService.getAllPurchaseOrders(1, 10);

      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('updatePurchaseOrder', () => {
    const mockUpdatedPO = {
      id: 'po1',
      po_number: 'PO-001-UPDATED',
      customerId: 'customer1',
      purchaseOrderDetails: [
        {
          id: 'existing-detail-1',
          kode_barang: '4324992',
          nama_barang: 'TAS BELANJA',
          quantity: 4,
          isi: 1,
          harga: 250000,
          harga_netto: 1000,
          total_pembelian: 990000,
          inventoryId: 'inventory1',
        },
      ],
      customer: { name: 'Test Customer' },
      supplier: null,
      status: { name: 'PENDING' },
      files: [],
    };

    const mockInventoryItem = {
      id: 'new-inventory-1',
      kode_barang: '123123',
      nama_barang: '213123',
      stok_barang: 1,
      harga_barang: 123123,
    };

    it('should update purchase order with existing inventory', async () => {
      const updateData = {
        po_number: 'PO-001-UPDATED',
        purchaseOrderDetails: [
          {
            id: 'existing-detail-1',
            kode_barang: '4324992',
            nama_barang: 'TAS BELANJA',
            quantity: 4,
            isi: 1,
            harga: 250000,
            harga_netto: 1000,
            total_pembelian: 990000,
            inventoryId: 'inventory1',
          },
        ],
      };

      // Mock the transaction
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue({ id: 'po1' }),
            update: jest.fn().mockResolvedValue(mockUpdatedPO),
          },
          purchaseOrderDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventory: {
            upsert: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.updatePurchaseOrder('po1', updateData);

      expect(result).toEqual(mockUpdatedPO);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should create new inventory for items without inventoryId', async () => {
      const updateData = {
        po_number: 'PO-001-UPDATED',
        purchaseOrderDetails: [
          {
            kode_barang: '123123',
            nama_barang: '213123',
            quantity: 1,
            isi: 1,
            harga: 123123,
            harga_netto: 123123,
            total_pembelian: 123123,
            // No inventoryId provided - should create new inventory
          },
        ],
      };

      // Mock the transaction
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue({ id: 'po1' }),
            update: jest.fn().mockResolvedValue({
              ...mockUpdatedPO,
              purchaseOrderDetails: [
                {
                  ...updateData.purchaseOrderDetails[0],
                  inventoryId: mockInventoryItem.id,
                },
              ],
            }),
          },
          purchaseOrderDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          inventory: {
            upsert: jest.fn().mockResolvedValue(mockInventoryItem),
          },
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.updatePurchaseOrder('po1', updateData);

      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw error when purchase order not found', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockTx);
      });

      await expect(
        PurchaseOrderService.updatePurchaseOrder('non-existent-po', {})
      ).rejects.toThrow(AppError);
    });
  });

  // Note: The processPurchaseOrder method has been enhanced to automatically
  // create packing, invoice, and surat jalan when processing a purchase order.
  // This ensures that all downstream documents are generated with details
  // matching the purchase order details.

  // Test for processPurchaseOrder method to verify suratJalan and invoicePengiriman relationships
  describe('processPurchaseOrder', () => {
    const mockPurchaseOrder = {
      id: 'po1',
      po_number: 'PO-001',
      customer: {
        name: 'Test Customer',
        address: 'Test Address'
      },
      purchaseOrderDetails: [
        {
          id: 'detail1',
          kode_barang: 'ITM001',
          nama_barang: 'Test Item',
          quantity: 10,
          isi: 5,
          harga: 1000,
          inventoryId: 'inv1'
        }
      ]
    };

    const mockStatus = {
      id: 'status1',
      status_code: 'PROCESSED PURCHASE ORDER'
    };

    const mockStatuses = {
      pendingPacking: { id: 'pending-packing', status_code: 'PENDING PACKING' },
      pendingItem: { id: 'pending-item', status_code: 'PENDING ITEM' },
      pendingInvoice: { id: 'pending-invoice', status_code: 'PENDING INVOICE' },
      pendingSuratJalan: { id: 'pending-surat-jalan', status_code: 'PENDING SURAT JALAN' }
    };

    const mockCreatedInvoice = {
      id: 'invoice1',
      no_invoice: 'INV-2025-09-PO-001'
    };

    const mockCreatedSuratJalan = {
      id: 'sj1',
      no_surat_jalan: 'SJ-20250915-PO-001'
    };

    it('should update purchase order with suratJalan and invoicePengiriman IDs when creating new documents', async () => {
      // Mock findUnique calls for purchase order and statuses
      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.status.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockStatus) // First call for the main status
        .mockResolvedValueOnce(mockStatuses.pendingPacking) // PENDING PACKING
        .mockResolvedValueOnce(mockStatuses.pendingItem) // PENDING ITEM
        .mockResolvedValueOnce(mockStatuses.pendingInvoice) // PENDING INVOICE
        .mockResolvedValueOnce(mockStatuses.pendingSuratJalan); // PENDING SURAT JALAN

      // Mock the transaction
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            update: jest.fn()
              .mockResolvedValueOnce({ // First update - status only
                ...mockPurchaseOrder,
                statusId: mockStatus.id
              })
              .mockResolvedValueOnce({ // Second update - with document IDs
                ...mockPurchaseOrder,
                statusId: mockStatus.id,
                invoicePengiriman: mockCreatedInvoice.id,
                suratJalan: mockCreatedSuratJalan.id
              })
          },
          packing: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({
              id: 'packing1',
              packing_number: 'PN-20250915-PO-001'
            })
          },
          status: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockStatuses.pendingPacking)
              .mockResolvedValueOnce(mockStatuses.pendingItem)
              .mockResolvedValueOnce(mockStatuses.pendingInvoice)
              .mockResolvedValueOnce(mockStatuses.pendingSuratJalan)
          },
          invoice: {
            findFirst: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockCreatedInvoice)
          },
          suratJalan: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockCreatedSuratJalan)
          }
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.processPurchaseOrder('po1', 'PROCESSED PURCHASE ORDER');

      expect(result.invoicePengiriman).toBe(mockCreatedInvoice.id);
      expect(result.suratJalan).toBe(mockCreatedSuratJalan.id);
    });

    it('should update purchase order with existing document IDs when documents already exist', async () => {
      const existingInvoice = { id: 'existing-invoice1' };
      const existingSuratJalan = { id: 'existing-sj1' };

      // Mock findUnique calls for purchase order and statuses
      (prisma.purchaseOrder.findUnique as jest.Mock).mockResolvedValue(mockPurchaseOrder);
      (prisma.status.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockStatus)
        .mockResolvedValueOnce(mockStatuses.pendingPacking)
        .mockResolvedValueOnce(mockStatuses.pendingItem)
        .mockResolvedValueOnce(mockStatuses.pendingInvoice)
        .mockResolvedValueOnce(mockStatuses.pendingSuratJalan);

      // Mock the transaction
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            update: jest.fn()
              .mockResolvedValueOnce({ // First update - status only
                ...mockPurchaseOrder,
                statusId: mockStatus.id
              })
              .mockResolvedValueOnce({ // Second update - with existing document IDs
                ...mockPurchaseOrder,
                statusId: mockStatus.id,
                invoicePengiriman: existingInvoice.id,
                suratJalan: existingSuratJalan.id
              })
          },
          packing: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({
              id: 'packing1',
              packing_number: 'PN-20250915-PO-001'
            })
          },
          status: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockStatuses.pendingPacking)
              .mockResolvedValueOnce(mockStatuses.pendingItem)
              .mockResolvedValueOnce(mockStatuses.pendingInvoice)
              .mockResolvedValueOnce(mockStatuses.pendingSuratJalan)
          },
          invoice: {
            findFirst: jest.fn().mockResolvedValue(existingInvoice), // Existing invoice found
            findUnique: jest.fn().mockResolvedValue(null)
          },
          suratJalan: {
            findFirst: jest.fn().mockResolvedValue(existingSuratJalan) // Existing surat jalan found
          }
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.processPurchaseOrder('po1', 'PROCESSED PURCHASE ORDER');

      expect(result.invoicePengiriman).toBe(existingInvoice.id);
      expect(result.suratJalan).toBe(existingSuratJalan.id);
    });
  });

  describe('deletePurchaseOrder', () => {
    it('should delete purchase order with all related documents and dependencies', async () => {
      const mockPurchaseOrderWithDependencies = {
        id: 'po1',
        po_number: 'PO-001',
        packings: [
          {
            id: 'packing1',
            packingItems: [
              { id: 'item1' },
              { id: 'item2' }
            ]
          }
        ],
        invoices: [
          {
            id: 'invoice1',
          }
        ]
      };

      const mockSuratJalans = [
        {
          id: 'sj1',
          suratJalanDetails: [
            {
              id: 'detail1',
              suratJalanDetailItems: [{ id: 'detailItem1' }]
            }
          ],
          historyPengiriman: [{ id: 'history1' }]
        }
      ];

      const mockDeletedPO = {
        id: 'po1',
        po_number: 'PO-001',
        customer: { name: 'Test Customer' },
        supplier: null,
        files: [],
        status: { name: 'DELETED' },
        purchaseOrderDetails: []
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue(mockPurchaseOrderWithDependencies),
            delete: jest.fn().mockResolvedValue(mockDeletedPO)
          },
          packingItem: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          packing: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          suratJalan: {
            findMany: jest.fn().mockResolvedValue(mockSuratJalans),
            delete: jest.fn().mockResolvedValue({ count: 1 })
          },
          suratJalanDetailItem: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          suratJalanDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          historyPengiriman: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          invoiceDetail: {
            deleteMany: jest.fn().mockResolvedValue({ count: 5 })
          },
          invoice: {
            delete: jest.fn().mockResolvedValue({ count: 1 })
          }
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.deletePurchaseOrder('po1');

      expect(result).toEqual(mockDeletedPO);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw AppError when purchase order is not found', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue(null)
          }
        };
        return callback(mockTx);
      });

      await expect(PurchaseOrderService.deletePurchaseOrder('non-existent-po'))
        .rejects.toThrow(new AppError('Purchase Order not found', 404));
    });

    it('should handle deletion of purchase order without related documents', async () => {
      const mockPurchaseOrderNoRelations = {
        id: 'po1',
        po_number: 'PO-001',
        packings: [],
        invoices: []
      };

      const mockDeletedPO = {
        id: 'po1',
        po_number: 'PO-001',
        customer: { name: 'Test Customer' },
        supplier: null,
        files: [],
        status: { name: 'DELETED' },
        purchaseOrderDetails: []
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          purchaseOrder: {
            findUnique: jest.fn().mockResolvedValue(mockPurchaseOrderNoRelations),
            delete: jest.fn().mockResolvedValue(mockDeletedPO)
          }
        };
        return callback(mockTx);
      });

      const result = await PurchaseOrderService.deletePurchaseOrder('po1');

      expect(result).toEqual(mockDeletedPO);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should handle errors during deletion and throw AppError', async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(PurchaseOrderService.deletePurchaseOrder('po1'))
        .rejects.toThrow(new AppError('Failed to delete purchase order', 500));
    });
  });
});