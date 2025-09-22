jest.mock('@/config/database', () => ({
  prisma: {
    menu: {
      findMany: jest.fn(),
    },
  },
}));

import { MenuService } from '@/services/menu.service';

const { prisma } = require('@/config/database');

describe('MenuService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retrieves top-level menus including children', async () => {
    (prisma.menu.findMany as jest.Mock).mockResolvedValue(['menu']);

    const result = await MenuService.getAll();

    expect(prisma.menu.findMany).toHaveBeenCalledWith({
      where: { parentId: null },
      include: { children: true },
    });
    expect(result).toEqual(['menu']);
  });
});
