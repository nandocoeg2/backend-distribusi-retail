import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import logger  from '@/config/logger';
import { AppError } from '@/utils/app-error';
import { ResponseUtil } from '@/utils/response.util';

export const errorHandler = (error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof AppError) {
    logger.warn(`Application Error: ${error.message}`, { statusCode: error.statusCode, details: error.details });
    const errorMessage = error.details ? `${error.message}: ${JSON.stringify(error.details)}` : error.message;
    return reply.status(error.statusCode).send(ResponseUtil.error(errorMessage));
  }

  if ('validation' in error) {
    logger.warn('Validation Error:', { details: error.validation });
    const validationErrors = error.validation ? JSON.stringify(error.validation) : 'Invalid input';
    return reply.status(400).send(ResponseUtil.error(`Validation Error: ${validationErrors}`));
  }

  logger.error('Unhandled Error:', error);
  return reply.status(500).send(ResponseUtil.error('Internal Server Error'));
};