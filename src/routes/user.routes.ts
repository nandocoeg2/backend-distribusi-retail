import { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import { UserController } from '@/controllers/user.controller';
import { validateRequest } from '@/middleware/validate-request';
import { 
  getUserSchema, 
  getAllUsersSchema, 
  createUserSchema, 
  updateUserSchema, 
  searchUserSchema 
} from '@/schemas/user.schema';

export const userRoutes: FastifyPluginCallback<FastifyPluginOptions> = (fastify, options, done) => {
  // Create User
  fastify.post(
    '/',
    {
      schema: {
        tags: ['User'],
        body: createUserSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(createUserSchema)],
    },
    UserController.createUser
  );

  // Get All Users with pagination
  fastify.get(
    '/',
    {
      schema: {
        tags: ['User'],
        querystring: getAllUsersSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate],
    },
    UserController.getUsers
  );

  // Search Users
  fastify.get(
    '/search',
    {
      schema: {
        tags: ['User'],
        querystring: searchUserSchema.shape.query,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(searchUserSchema)],
    },
    UserController.searchUsers
  );

  // Get User by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['User'],
        params: getUserSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getUserSchema)],
    },
    UserController.getUser
  );

  // Update User
  fastify.put<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['User'],
        params: getUserSchema.shape.params,
        body: updateUserSchema.shape.body,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(updateUserSchema)],
    },
    UserController.updateUser
  );

  // Delete User
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['User'],
        params: getUserSchema.shape.params,
        security: [{ Bearer: [] }],
      },
      preHandler: [fastify.authenticate, validateRequest(getUserSchema)],
    },
    UserController.deleteUser
  );

  done();
};