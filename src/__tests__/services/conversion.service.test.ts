import { convertFileToJson } from '@/services/conversion.service';

// Mock the entire module
jest.mock('@/services/conversion.service', () => ({
  __esModule: true,
  convertFileToJson: jest.fn(),
}));

describe('Conversion Service', () => {
  const mockedConvertFileToJson = convertFileToJson as jest.Mock;

  afterEach(() => {
    mockedConvertFileToJson.mockClear();
  });

  it('should convert a file to JSON successfully', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';
    const jsonResponse = { key: 'value' };

    mockedConvertFileToJson.mockResolvedValue(jsonResponse);

    const result = await convertFileToJson(file, mimeType, prompt);

    expect(result).toEqual(jsonResponse);
    expect(mockedConvertFileToJson).toHaveBeenCalledWith(file, mimeType, prompt);
  });

  it('should throw an error if JSON parsing fails', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';

    mockedConvertFileToJson.mockRejectedValue(new Error('Could not parse the converted file content.'));

    await expect(convertFileToJson(file, mimeType, prompt)).rejects.toThrow(
      'Could not parse the converted file content.'
    );
  });

  it('should throw an error if the Gemini API call fails', async () => {
    const file = Buffer.from('test file');
    const mimeType = 'application/pdf';
    const prompt = 'test prompt';

    mockedConvertFileToJson.mockRejectedValue(new Error('Failed to get a response from the conversion service.'));

    await expect(convertFileToJson(file, mimeType, prompt)).rejects.toThrow(
      'Failed to get a response from the conversion service.'
    );
  });
});

