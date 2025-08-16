import 'fastify';

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string;
      iat: number;
      exp: number;
    };
  }

  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}