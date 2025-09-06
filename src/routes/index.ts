import { type App } from '@/app';
import { authRoutes } from '@/routes/auth.routes';
import { userRoutes } from '@/routes/user.routes';
import roleRoutes from '@/routes/role.routes';
import menuRoutes from '@/routes/menu.routes';
import { customerRoutes } from './customer.routes';
import { purchaseOrderRoutes } from './purchase-order.routes';
import { supplierRoutes } from './supplier.routes';
import { conversionRoutes } from './conversion.routes';
import { inventoryRoutes } from './inventory.routes';
import notificationRoutes from './notification.routes';
import { statusRoutes } from './status.routes';
import { bulkPurchaseOrderRoutes } from './bulk-purchase-order.routes';
import { packingRoutes } from './packing.routes';

import { fileRoutes } from './file.routes';



export default async (fastify: App) => {

  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(roleRoutes, { prefix: '/roles' });
  fastify.register(menuRoutes, { prefix: '/menus' });
  fastify.register(customerRoutes, { prefix: '/customers' });
  fastify.register(supplierRoutes, { prefix: '/suppliers' });
  fastify.register(purchaseOrderRoutes, { prefix: '/purchase-orders' });
  fastify.register(conversionRoutes, { prefix: '/conversions' });
  fastify.register(inventoryRoutes, { prefix: '/inventories' });
  fastify.register(notificationRoutes, { prefix: '/notifications' });
  fastify.register(statusRoutes, { prefix: '/statuses' });
  fastify.register(fileRoutes, { prefix: '/files' });
  fastify.register(bulkPurchaseOrderRoutes, { prefix: '/purchase-orders' });
  fastify.register(packingRoutes, { prefix: '/packings' });
};
