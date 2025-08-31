import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusService } from '@/services/status.service';

export class StatusController {
  static async getStatuses(request: FastifyRequest, reply: FastifyReply) {
    const statuses = await StatusService.getAllStatuses();
    return reply.send(statuses);
  }
}

