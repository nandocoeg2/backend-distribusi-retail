import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import logger  from '@/config/logger';
import { AppError } from '@/utils/app-error';

export const errorHandler = (error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof AppError) {
    logger.warn(`Application Error: ${error.message}`, { statusCode: error.statusCode, details: error.details });
    return reply.status(error.statusCode).send({ message: error.message, details: error.details });
  }

  if ('validation' in error) {
    logger.warn('Validation Error:', { details: error.validation });
    return reply.status(400).send({ message: 'Validation Error', details: error.validation });
  }

  logger.error('Unhandled Error:', error);
  return reply.status(500).send({ message: 'Internal Server Error' });
};