import { ConversionService } from '@/services/conversion.service';

const mockGenerateContent: jest.Mock = jest.fn();
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: (...args: any[]) => mockGenerateContent(...args),
        },
      };
    }),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      INTEGER: 'INTEGER',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY',
    },
  };
});

jest.mock('@/config/database', () => ({
  prisma: {
    customer: {
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = require('@/config/database');

describe('ConversionService', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
    (prisma.customer.findMany as jest.Mock).mockReset();
    (prisma.customer.findMany as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should convert a file to JSON successfully with customer RAG context', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';
    const jsonResponse = { key: 'value' };
    const customerDataset = [
      {
        namaCustomer: 'Customer Sukses',
        kodeCustomer: 'CUST-001',
        alamatPengiriman: 'Jl. Kebon Jeruk No. 123',
      },
    ];

    (prisma.customer.findMany as jest.Mock).mockResolvedValue(customerDataset);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(jsonResponse),
    });

    const result = await ConversionService.convertFileToJson(
      file,
      mimeType,
      prompt
    );

    expect(result).toEqual(jsonResponse);
    expect(prisma.customer.findMany).toHaveBeenCalledWith({
      select: {
        namaCustomer: true,
        kodeCustomer: true,
        alamatPengiriman: true,
      },
      orderBy: {
        namaCustomer: 'asc',
      },
    });
    expect(mockGenerateContent).toHaveBeenCalled();

    const request = mockGenerateContent.mock.calls[0][0];
    expect(request.contents[0]).toContain('Customer reference data');
    expect(request.contents[0]).toContain('"kodeCustomer":"CUST-001"');
  });

  it('should throw an error if JSON parsing fails', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';

    mockGenerateContent.mockResolvedValue({
      text: 'invalid json',
    });

    await expect(
      ConversionService.convertFileToJson(file, mimeType, prompt)
    ).rejects.toThrow('Could not parse the converted file content.');
  });

  it('should throw an error if the Gemini API call fails', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';

    mockGenerateContent.mockRejectedValue(new Error('API error'));

    await expect(
      ConversionService.convertFileToJson(file, mimeType, prompt)
    ).rejects.toThrow('Failed to get a response from the conversion service.');
  });

  it('should continue with the base prompt when customer fetch fails', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';
    const jsonResponse = { key: 'value' };

    (prisma.customer.findMany as jest.Mock).mockRejectedValue(
      new Error('db error')
    );
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(jsonResponse),
    });

    await ConversionService.convertFileToJson(file, mimeType, prompt);

    const request = mockGenerateContent.mock.calls[0][0];
    expect(request.contents[0]).toBe(prompt);
  });

  it('should skip customer RAG for non bulk-purchase schema', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';
    const jsonResponse = { key: 'value' };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(jsonResponse),
    });

    await ConversionService.convertFileToJson(
      file,
      mimeType,
      prompt,
      'laporan-penerimaan-barang'
    );

    expect(prisma.customer.findMany).not.toHaveBeenCalled();
  });
});
