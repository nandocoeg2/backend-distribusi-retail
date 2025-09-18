import { FastifyRequest, FastifyReply } from 'fastify';
import { ConversionService } from '@/services/conversion.service';
import { AppError } from '@/utils/app-error';
import logger from '@/config/logger';
import { ResponseUtil } from '@/utils/response.util';

export class ConversionController {
  static async convertFile(request: FastifyRequest, reply: FastifyReply) {
    logger.info('Starting multipart form processing...');
    const parts = request.parts();
    let file: Buffer | undefined;
    let prompt: string | undefined;
    let mimetype: string | undefined;

    for await (const part of parts) {
      logger.info(`Processing part: ${part.fieldname}`);
      if (part.type === 'file') {
        file = await part.toBuffer();
        mimetype = part.mimetype;
        logger.info(`Processed file: ${part.filename}`);
      } else if (part.type === 'field' && part.fieldname === 'prompt') {
        prompt = part.value as string;
        logger.info('Processed prompt field.');
      }
    }
    logger.info('Finished multipart form processing.');

    if (!file || !mimetype) {
      throw new AppError('No file uploaded.', 400);
    }

    if (!prompt) {
      throw new AppError('The \'prompt\' field is required.', 400);
    }

    const jsonResult = await ConversionService.convertFileToJson(file, mimetype, prompt);
    return reply.send(ResponseUtil.success(jsonResult));
  }
}
