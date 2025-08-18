import { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      id: string;
      iat: number;
      exp: number;
    };
    parts: () => AsyncIterable<{
      type: 'file' | 'field';
      toBuffer: () => Promise<Buffer>;
      value: string | Buffer;
      fieldname: string;
      filename: string;
      encoding: string;
      mimetype: string;
      file: any; // The underlying file stream
    }>;
  }
}

