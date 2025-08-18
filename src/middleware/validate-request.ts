import { FastifyRequest, FastifyReply, DoneFuncWithErrOrRes } from 'fastify';
import { z, ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      done();
    } catch (e) {
      if (e instanceof z.ZodError) {
        reply.code(400).send({
          success: false,
          error: 'Validation failed',
          issues: e.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        reply.code(500).send({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred during validation.',
        });
      }
    }
  };
};
