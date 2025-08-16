import 'fastify';
import '@fastify/cookie';

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string;
      iat: number;
      exp: number;
    };
    cookies: { [cookieName: string]: string | undefined };
  }

  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}