import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
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
