import { FastifyRequest, FastifyReply, DoneFuncWithErrOrRes } from 'fastify';
import { ZodSchema } from 'zod';
import { AppError } from '@/utils/app-error';

export const validateRequest = <T extends ZodSchema>(schema: T) => {
  return (req: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      done();
    } catch (error: any) {
      const validationErrors = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return reply.code(400).send({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
  };
};