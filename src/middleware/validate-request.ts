import { FastifyRequest, FastifyReply, DoneFuncWithErrOrRes } from 'fastify';
import { ZodSchema } from 'zod';

export const validateRequest = <T extends ZodSchema & { shape?: unknown }>(
  schema: T
) => {
  return (req: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes) => {
    try {
      if (schema.shape && typeof schema.shape === 'object' && 'body' in schema.shape) {
        schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      } else {
        schema.parse(req.body);
      }
      done();
    } catch (error: any) {
      const validationErrors = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      reply.code(400).send({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
  };
};
