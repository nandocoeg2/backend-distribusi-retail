import { FastifyRequest, FastifyReply, DoneFuncWithErr } from 'fastify';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/app-error';

export const validateRequest = <T extends ZodSchema>(schema: T) => {
  return (req: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErr) => {
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
      done(new AppError('Validation failed', 400, validationErrors));
    }
  };
};