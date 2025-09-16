import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { RegionController } from '../controllers/region.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  createRegionSchema,
  CreateRegionInput,
  deleteRegionSchema,
  getRegionSchema,
  searchRegionSchema,
  updateRegionSchema,
  UpdateRegionInput,
  GetAllRegionsInput,
  getAllRegionsSchema,
} from '../schemas/region.schema';

export const regionRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  fastify.get<{ Params: { q: string }; Querystring: GetAllRegionsInput['query'] }>(
    '/search/:q',
    {
      preHandler: [fastify.authenticate, validateRequest(searchRegionSchema)],
    },
    RegionController.searchRegions
  );

  fastify.get<{ Querystring: GetAllRegionsInput['query'] }>(
    '/search',
    {
      preHandler: [fastify.authenticate, validateRequest(getAllRegionsSchema)],
    },
    RegionController.searchRegions
  );

  fastify.post<{ Body: CreateRegionInput }>(
    '/',
    {
      preHandler: [fastify.authenticate, validateRequest(createRegionSchema)],
    },
    RegionController.createRegion
  );

  fastify.get<{ Querystring: GetAllRegionsInput['query'] }>('/', { 
    preHandler: [fastify.authenticate, validateRequest(getAllRegionsSchema)] 
  }, RegionController.getRegions);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(getRegionSchema)],
    },
    RegionController.getRegion
  );

  fastify.put<{ Params: { id: string }; Body: UpdateRegionInput['body'] }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(updateRegionSchema)],
    },
    RegionController.updateRegion
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate, validateRequest(deleteRegionSchema)],
    },
    RegionController.deleteRegion
  );

  done();
};
