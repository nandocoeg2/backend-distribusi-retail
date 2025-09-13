export const prisma = {
  session: {
    create: jest.fn().mockResolvedValue({}),
  },
  suratJalan: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  suratJalanDetail: {
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  suratJalanDetailItem: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  historyPengiriman: {
    deleteMany: jest.fn(),
  },
  invoice: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};