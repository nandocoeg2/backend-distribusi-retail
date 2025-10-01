import { ConversionService } from '@/services/conversion.service';
import { AppError } from '@/utils/app-error';

var mockGenerateContent: jest.Mock = jest.fn();
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

describe.skip('ConversionService', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
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
      text: JSON.stringify(jsonResponse),
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
      text: 'invalid json',
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
