import { FastifyRequest, FastifyReply } from 'fastify';
import { convertFileHandler } from '@/controllers/conversion.controller';
import * as conversionService from '@/services/conversion.service';
import { AppError } from '@/utils/app-error';
import stream from 'stream';

describe('Conversion Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
      parts: jest.fn(),
    };
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should convert a file to JSON and return the result', async () => {
    const fileBuffer = Buffer.from('test file content');
    const prompt = 'test prompt';
    const mimetype = 'application/pdf';
    const jsonResult = { key: 'value' };

    const parts = async function* () {
      yield {
        type: 'file',
        fieldname: 'file',
        filename: 'test.pdf',
        encoding: '7bit',
        mimetype,
        toBuffer: jest.fn().mockResolvedValue(fileBuffer),
        file: new stream.Readable(),
      };
      yield {
        type: 'field',
        fieldname: 'prompt',
        value: prompt,
        fieldnameTruncated: false,
        valueTruncated: false,
        encoding: '7bit',
        mimetype: 'text/plain',
      };
    };

    (request.parts as jest.Mock).mockReturnValue(parts());
    jest.spyOn(conversionService, 'convertFileToJson').mockResolvedValue(jsonResult);

    await convertFileHandler(request as FastifyRequest, reply as FastifyReply);

    expect(conversionService.convertFileToJson).toHaveBeenCalledWith(fileBuffer, mimetype, prompt);
    expect(reply.send).toHaveBeenCalledWith(jsonResult);
  });

  it('should throw an error if no file is uploaded', async () => {
    const parts = async function* () {
      yield {
        type: 'field',
        fieldname: 'prompt',
        value: 'test prompt',
      };
    };

    (request.parts as jest.Mock).mockReturnValue(parts());

    await expect(convertFileHandler(request as FastifyRequest, reply as FastifyReply)).rejects.toThrow(
      new AppError('No file uploaded.', 400)
    );
  });

  it('should throw an error if the prompt field is missing', async () => {
    const fileBuffer = Buffer.from('test file content');
    const mimetype = 'application/pdf';

    const parts = async function* () {
      yield {
        type: 'file',
        fieldname: 'file',
        filename: 'test.pdf',
        toBuffer: jest.fn().mockResolvedValue(fileBuffer),
        mimetype,
      };
    };

    (request.parts as jest.Mock).mockReturnValue(parts());

    await expect(convertFileHandler(request as FastifyRequest, reply as FastifyReply)).rejects.toThrow(
      new AppError('The \'prompt\' field is required.', 400)
    );
  });
});

