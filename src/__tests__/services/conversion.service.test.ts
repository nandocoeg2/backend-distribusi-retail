import { ConversionService } from '@/services/conversion.service';
import { AppError } from '@/utils/app-error';

let mockGenerateContent: jest.Mock;
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockImplementation(() => {
                    return {
                        generateContent: mockGenerateContent,
                    };
                }),
            };
        }),
        SchemaType: {
            OBJECT: 'OBJECT',
            STRING: 'STRING',
            INTEGER: 'INTEGER',
            NUMBER: 'NUMBER',
            ARRAY: 'ARRAY',
        },
    };
});

describe.skip('ConversionService', () => {
  beforeEach(() => {
    mockGenerateContent = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should convert a file to JSON successfully', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';
    const jsonResponse = { key: 'value' };

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(jsonResponse),
      },
    });

    const result = await ConversionService.convertFileToJson(file, mimeType, prompt);

    expect(result).toEqual(jsonResponse);
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('should throw an error if JSON parsing fails', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'invalid json',
      },
    });

    await expect(ConversionService.convertFileToJson(file, mimeType, prompt)).rejects.toThrow(
      'Could not parse the converted file content.'
    );
  });

  it('should throw an error if the Gemini API call fails', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';

    mockGenerateContent.mockRejectedValue(new Error('API error'));

    await expect(ConversionService.convertFileToJson(file, mimeType, prompt)).rejects.toThrow(
      'Failed to get a response from the conversion service.'
    );
  });
});
