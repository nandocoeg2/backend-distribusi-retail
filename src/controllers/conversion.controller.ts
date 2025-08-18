import { FastifyRequest, FastifyReply } from 'fastify';
import { convertFileToJson } from '@/services/conversion.service';
import { AppError } from '@/utils/app-error';
import logger from '@/config/logger';

export const convertFileHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  logger.info('Starting multipart form processing...');
  const parts = request.parts();
  let file: Buffer | undefined;
  let prompt: string | undefined;
  let mimetype: string | undefined;

  try {
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
  } catch (error) {
    logger.error('Error processing multipart form', { error });
    throw new AppError('Failed to process uploaded file.', 500);
  }


  if (!file || !mimetype) {
    throw new AppError('No file uploaded.', 400);
  }

  if (!prompt) {
    throw new AppError('The \'prompt\' field is required.', 400);
  }

  try {
    const jsonResult = await convertFileToJson(file, mimetype, prompt);
    return reply.send(jsonResult);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('File conversion failed.', 500);
  }
};
