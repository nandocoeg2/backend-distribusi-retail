import { Customer, POType, Status, Supplier } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

export type RawConvertedPayload = Record<string, unknown>;

export interface NormalizedItem {
  productName?: string;
  plu?: string;
  qtyOrdered_carton: number;
  isi: number;
  price_perCarton?: number | null;
  totalLine_net?: number | null;
  potongan_a?: number | null;
  harga_after_potongan_a?: number | null;
  potongan_b?: number | null;
  harga_after_potongan_b?: number | null;
}

export interface PurchaseOrderDetailInput {
  plu: string;
  nama_barang: string;
  quantity: number;
  isi: number;
  harga: number;
  potongan_a: number | null;
  harga_after_potongan_a: number | null;
  potongan_b: number | null;
  harga_after_potongan_b: number | null;
  harga_netto: number;
  total_pembelian: number;
}

export interface NormalizedItemsResult {
  normalizedItems: NormalizedItem[];
  detailInputs: PurchaseOrderDetailInput[];
  totalItems: number;
}

export interface NormalizedInvoice {
  TOTAL_PURCHASE_PRICE?: number | null;
  TOTAL_AFTER_DISCOUNT?: number | null;
  TOTAL_ITEM_DISCOUNT?: number | null;
  TOTAL_INVOICE?: number | null;
  TOTAL_INVOICE_DISCOUNT?: number | null;
  TOTAL_BONUS?: number | null;
  TOTAL_LST?: number | null;
  TOTAL_VAT_INPUT?: number | null;
  TOTAL_INCLUDE_VAT?: number | null;
  amountInWords?: string;
}

export interface PersistedDetail extends PurchaseOrderDetailInput {
  inventoryId: string;
}

const DEFAULT_PROMPT =
  'Convert this document into structured JSON format for bulk purchase order processing. ' +
  'Extract relevant information such as order details, supplier information, items, pricing, and payment information.';

const MONTH_MAP: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    let trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const negative = trimmed.startsWith('-');
    if (negative) {
      trimmed = trimmed.slice(1);
    }

    const unsigned = trimmed.replace(/[^0-9.,]/g, '');
    if (!unsigned) {
      return null;
    }

    const hasComma = unsigned.includes(',');
    const hasDot = unsigned.includes('.');
    let normalized = unsigned;

    if (hasComma && hasDot) {
      if (unsigned.lastIndexOf(',') > unsigned.lastIndexOf('.')) {
        normalized = unsigned.replace(/\./g, '').replace(/,/g, '.');
      } else {
        normalized = unsigned.replace(/,/g, '');
      }
    } else if (hasComma) {
      normalized = unsigned.replace(/\./g, '').replace(/,/g, '.');
    } else if (hasDot) {
      const dotCount = (unsigned.match(/\./g) || []).length;
      if (dotCount > 1) {
        normalized = unsigned.replace(/\./g, '');
      }
    }

    const prefix = negative ? '-' : '';
    const parsed = Number(prefix + normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toInteger = (value: unknown, fallback = 0): number => {
  const num = toNumber(value);
  return Number.isFinite(num) ? Math.trunc(num as number) : fallback;
};

const sanitizeString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
};

export const buildPrompt = (prompt?: string) => prompt || DEFAULT_PROMPT;

export const unwrapPayload = (convertedData: any): RawConvertedPayload => {
  if (
    convertedData &&
    typeof convertedData === 'object' &&
    'data' in convertedData
  ) {
    const nested = (convertedData as Record<string, unknown>).data;
    if (nested && typeof nested === 'object') {
      return nested as RawConvertedPayload;
    }
  }
  return (convertedData ?? {}) as RawConvertedPayload;
};

export const normalizeItems = (
  payload: RawConvertedPayload
): NormalizedItemsResult => {
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];

  const normalizedItems: NormalizedItem[] = rawItems.map(
    (item: any, index: number) => {
      const qty = Math.max(toInteger(item?.qtyOrdered_carton, 0), 0);
      const isi = Math.max(
        toInteger(item?.isi ?? item?.cartonContent ?? 1, 1),
        1
      );
      const fallbackName = 'Item ' + (index + 1);
      return {
        productName: sanitizeString(item?.productName) || fallbackName,
        plu: sanitizeString(item?.plu),
        qtyOrdered_carton: qty,
        isi,
        price_perCarton: toNumber(item?.price_perCarton),
        totalLine_net: toNumber(item?.totalLine_net),
        potongan_a: toNumber(item?.potongan_a),
        harga_after_potongan_a: toNumber(item?.harga_after_potongan_a),
        potongan_b: toNumber(item?.potongan_b),
        harga_after_potongan_b: toNumber(item?.harga_after_potongan_b),
      };
    }
  );

  const detailInputs: PurchaseOrderDetailInput[] = normalizedItems
    .map((item, index) => {
      const fallbackPlu = 'UNKNOWN-' + Date.now() + '-' + (index + 1);
      const fallbackName = 'Item ' + (index + 1);
      const plu = item.plu || fallbackPlu;
      const nama_barang = item.productName || fallbackName;
      const quantity = item.qtyOrdered_carton;
      const isi = item.isi;
      const harga = item.price_perCarton ?? 0;
      const totalLineNet = item.totalLine_net;
      const harga_netto =
        quantity > 0 && totalLineNet !== null ? totalLineNet / quantity : harga;
      const total_pembelian = totalLineNet ?? quantity * harga;

      return {
        plu,
        nama_barang,
        quantity,
        isi,
        harga,
        potongan_a: item.potongan_a ?? null,
        harga_after_potongan_a: item.harga_after_potongan_a ?? null,
        potongan_b: item.potongan_b ?? null,
        harga_after_potongan_b: item.harga_after_potongan_b ?? null,
        harga_netto: harga_netto ?? 0,
        total_pembelian,
      };
    })
    .filter(
      (detail) =>
        detail.quantity > 0 || detail.harga > 0 || detail.total_pembelian > 0
    );

  const totalItems = detailInputs.reduce(
    (sum, detail) => sum + detail.quantity,
    0
  );

  return { normalizedItems, detailInputs, totalItems };
};

export const normalizeInvoice = (
  invoicePayload: unknown
): NormalizedInvoice | undefined => {
  if (!invoicePayload || typeof invoicePayload !== 'object') {
    return undefined;
  }

  const invoice = invoicePayload as Record<string, unknown>;

  return {
    TOTAL_PURCHASE_PRICE: toNumber(invoice.TOTAL_PURCHASE_PRICE),
    TOTAL_AFTER_DISCOUNT: toNumber(invoice.TOTAL_AFTER_DISCOUNT),
    TOTAL_ITEM_DISCOUNT: toNumber(invoice.TOTAL_ITEM_DISCOUNT),
    TOTAL_INVOICE: toNumber(invoice.TOTAL_INVOICE),
    TOTAL_INVOICE_DISCOUNT: toNumber(invoice.TOTAL_INVOICE_DISCOUNT),
    TOTAL_BONUS: toNumber(invoice.TOTAL_BONUS),
    TOTAL_LST: toNumber(invoice.TOTAL_LST),
    TOTAL_VAT_INPUT: toNumber(invoice.TOTAL_VAT_INPUT),
    TOTAL_INCLUDE_VAT: toNumber(invoice.TOTAL_INCLUDE_VAT),
    amountInWords: sanitizeString(invoice.amountInWords),
  };
};

export const parseOrderDate = (value: unknown): Date => {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return new Date();
    }

    const direct = new Date(trimmed);
    if (!isNaN(direct.getTime())) {
      return direct;
    }

    const match = trimmed.match(/(\d{1,2})[\s-]?([A-Za-z]{3,})[\s-]?(\d{2,4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthToken = match[2].slice(0, 3).toUpperCase();
      const yearToken = match[3];
      const monthIndex = MONTH_MAP[monthToken];

      if (monthIndex !== undefined && !Number.isNaN(day)) {
        const year =
          yearToken.length === 2
            ? 2000 + parseInt(yearToken, 10)
            : parseInt(yearToken, 10);
        if (!Number.isNaN(year) && !Number.isNaN(day)) {
          return new Date(Date.UTC(year, monthIndex, day));
        }
      }
    }
  }

  return new Date();
};

export const normalizePoType = (type: unknown): POType => {
  if (typeof type === 'string') {
    const normalized = type.trim().toUpperCase();
    if (normalized === 'AUTO' || normalized === 'BULK') {
      return POType.AUTO;
    }
    if (normalized === 'MANUAL' || normalized === 'SINGLE') {
      return POType.MANUAL;
    }
  }
  return POType.MANUAL;
};

export const resolveSupplier = async (
  supplierPayload: unknown,
  userId?: string
): Promise<Supplier | null> => {
  if (!supplierPayload || typeof supplierPayload !== 'object') {
    return null;
  }

  const supplierObj = supplierPayload as Record<string, unknown>;
  const supplierName = supplierObj.name as string | undefined;
  if (!supplierName) {
    return null;
  }

  const supplierCode = sanitizeString(supplierObj.code)?.toUpperCase();
  const supplierPhone = sanitizeString(supplierObj.phone);

  const where: any = {
    OR: [{ name: { equals: supplierName, mode: 'insensitive' } }],
  };

  if (supplierCode) {
    where.OR.push({ code: supplierCode });
  }

  let supplier = await prisma.supplier.findFirst({ where });

  const supplierData = {
    name: supplierName,
    address: (supplierObj.address as string) ?? '',
    phoneNumber: supplierPhone || 'N/A',
    email: sanitizeString(supplierObj.email) ?? null,
    bank: supplierObj.bank ?? null,
    code: supplierCode ?? null,
    createdBy: userId || 'system',
    updatedBy: userId || 'system',
  };

  if (!supplier) {
    supplier = await prisma.supplier.create({ data: supplierData });
  } else {
    supplier = await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        address: supplierData.address,
        phoneNumber: supplierPhone || supplier.phoneNumber,
        email: supplierData.email ?? supplier.email,
        bank: supplierData.bank ?? supplier.bank,
        code: supplierData.code ?? supplier.code,
        updatedBy: supplierData.updatedBy,
      },
    });
  }

  return supplier;
};

export const resolveCustomer = async (
  customerPayload: unknown,
  userId?: string
): Promise<Customer | null> => {
  if (!customerPayload || typeof customerPayload !== 'object') {
    return null;
  }

  const customerObj = customerPayload as Record<string, unknown>;
  const customerName = customerObj.name as string | undefined;
  if (!customerName) {
    return null;
  }

  const customerCode = sanitizeString(customerObj.code)?.toUpperCase();
  const where: any = {
    OR: [{ namaCustomer: { equals: customerName, mode: 'insensitive' } }],
  };

  if (customerCode) {
    where.OR.push({ kodeCustomer: customerCode });
  }

  let customer = await prisma.customer.findFirst({ where });

  if (!customer) {
    const [defaultGroup, defaultRegion] = await Promise.all([
      prisma.groupCustomer.findFirst({ select: { id: true } }),
      prisma.region.findFirst({ select: { id: true } }),
    ]);

    if (!defaultGroup || !defaultRegion) {
      throw new AppError(
        'Konfigurasi master data pelanggan tidak lengkap.',
        500
      );
    }

    const newCustomerData = {
      namaCustomer: customerName,
      kodeCustomer: customerCode || 'CUST-' + Date.now(),
      groupCustomerId: defaultGroup.id,
      regionId: defaultRegion.id,
      alamatPengiriman: (customerObj.address as string) ?? '',
      phoneNumber: sanitizeString(customerObj.phone) || 'N/A',
      email: sanitizeString(customerObj.email) ?? null,
      createdBy: userId || 'system',
      updatedBy: userId || 'system',
    };

    customer = await prisma.customer.create({ data: newCustomerData });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        alamatPengiriman:
          (customerObj.address as string) ?? customer.alamatPengiriman,
        phoneNumber: sanitizeString(customerObj.phone) || customer.phoneNumber,
        email: sanitizeString(customerObj.email) ?? customer.email,
        updatedBy: userId || 'system',
      },
    });
  }

  return customer;
};

export const fetchDefaultStatus = () =>
  prisma.status.findUnique({
    where: {
      status_code_category: {
        status_code: 'PENDING PURCHASE ORDER',
        category: 'Purchase Order',
      },
    },
  });

export const buildCreateData = (params: {
  poNumber?: unknown;
  parsedOrderDate: Date;
  poType: POType;
  totalItems: number;
  hasDetails: boolean;
  supplier: Supplier | null;
  customer: Customer | null;
  status: Status | null;
  userId?: string;
}) => {
  const {
    poNumber,
    parsedOrderDate,
    poType,
    totalItems,
    hasDetails,
    supplier,
    customer,
    status,
    userId,
  } = params;

  const createData: any = {
    po_number: sanitizeString(poNumber) || 'PO-' + Date.now(),
    tanggal_masuk_po: parsedOrderDate,
    po_type: poType,
    total_items: hasDetails ? totalItems : undefined,
    createdBy: userId || 'system',
    updatedBy: userId || 'system',
  };

  if (supplier) {
    createData.supplier = { connect: { id: supplier.id } };
  }

  if (customer) {
    createData.customer = { connect: { id: customer.id } };
  }

  if (status) {
    createData.status = { connect: { id: status.id } };
  }

  return createData;
};

export const persistPurchaseOrder = async (params: {
  createData: Record<string, unknown>;
  detailInputs: PurchaseOrderDetailInput[];
  userId?: string;
}): Promise<{
  purchaseOrder: { id: string; po_number: string };
  persistedDetails: PersistedDetail[];
}> => {
  const { createData, detailInputs, userId } = params;
  let persistedDetails: PersistedDetail[] = [];

  const purchaseOrder = await prisma.$transaction(async (tx) => {
    const createdPO = await tx.purchaseOrder.create({ data: createData });

    if (detailInputs.length > 0) {
      const detailRecords = await Promise.all(
        detailInputs.map(async (detail) => {
          const inventory = await tx.inventory.upsert({
            where: { plu: detail.plu },
            create: {
              plu: detail.plu,
              nama_barang: detail.nama_barang,
              stok_c: detail.quantity,
              stok_q: 0,
              harga_barang: detail.harga,
              createdBy: userId || 'system',
              updatedBy: userId || 'system',
            },
            update: {
              nama_barang: detail.nama_barang,
              harga_barang: detail.harga,
              updatedBy: userId || 'system',
            },
          });

          return {
            ...detail,
            inventoryId: inventory.id,
            purchaseOrderId: createdPO.id,
            createdBy: userId || 'system',
            updatedBy: userId || 'system',
          };
        })
      );

      await tx.purchaseOrderDetail.createMany({
        data: detailRecords.map(
          ({ id, createdAt, updatedAt, ...rest }) => rest
        ),
      });

      persistedDetails = detailRecords.map(
        ({ createdBy, updatedBy, purchaseOrderId, ...rest }) => ({
          ...rest,
        })
      );
    }

    return createdPO;
  });

  return {
    purchaseOrder,
    persistedDetails,
  };
};
