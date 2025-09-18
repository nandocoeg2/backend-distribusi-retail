import { FastifyRequest, FastifyReply } from 'fastify';
import { ConversionController } from '@/controllers/conversion.controller';
import { ConversionService } from '@/services/conversion.service';
import { ResponseUtil } from '@/utils/response.util';
import { AppError } from '@/utils/app-error';

jest.mock('@/services/conversion.service');

describe('ConversionController', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {
        parts: jest.fn().mockImplementation(async function* () {
            yield { type: 'file', fieldname: 'file', toBuffer: () => Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf' };
            yield { type: 'field', fieldname: 'prompt', value: 'test prompt' };
        }),
    };
    reply = {
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('convertFile', () => {
    it('should convert a file and return the result', async () => {
      const jsonResult = { key: 'value' };
      (ConversionService.convertFileToJson as jest.Mock).mockResolvedValue(jsonResult);

      await ConversionController.convertFile(request as FastifyRequest, reply as FastifyReply);

      expect(ConversionService.convertFileToJson).toHaveBeenCalledWith(Buffer.from('test'), 'application/pdf', 'test prompt');
      expect(reply.send).toHaveBeenCalledWith(ResponseUtil.success(jsonResult));
    });

    it('should throw an error if no file is uploaded', async () => {
        request.parts = jest.fn().mockImplementation(async function* () {
            yield { type: 'field', fieldname: 'prompt', value: 'test prompt' };
        });

        await expect(ConversionController.convertFile(request as FastifyRequest, reply as FastifyReply)).rejects.toThrow(
            new AppError('No file uploaded.', 400)
        );
    });

    it('should throw an error if no prompt is provided', async () => {
        request.parts = jest.fn().mockImplementation(async function* () {
            yield { type: 'file', fieldname: 'file', toBuffer: () => Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf' };
        });

        await expect(ConversionController.convertFile(request as FastifyRequest, reply as FastifyReply)).rejects.toThrow(
            new AppError('The \'prompt\' field is required.', 400)
        );
    });
  });
});
