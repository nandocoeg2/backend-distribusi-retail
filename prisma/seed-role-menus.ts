import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all roles
  const roles = await prisma.role.findMany();
  
  if (roles.length === 0) {
    console.log('No roles found. Please run seed:roles first.');
    return;
  }

  // Get all menus
  const menus = await prisma.menu.findMany();
  
  if (menus.length === 0) {
    console.log('No menus found. Please run seed:menus first.');
    return;
  }

  // Clear existing role-menu assignments
  await prisma.roleMenu.deleteMany({});

  // Assign all menus to all roles
  const roleMenuData: { roleId: string; menuId: string }[] = [];
  
  for (const role of roles) {
    for (const menu of menus) {
      roleMenuData.push({
        roleId: role.id,
        menuId: menu.id,
      });
    }
  }

  await prisma.roleMenu.createMany({
    data: roleMenuData,
  });

  console.log('Seed role-menus selesai.');
  console.log(`Assigned ${menus.length} menus to ${roles.length} roles`);
  console.log(`Total assignments: ${roleMenuData.length}`);
  
  // Show summary
  for (const role of roles) {
    const assignedMenus = await prisma.roleMenu.findMany({
      where: { roleId: role.id },
      include: { menu: true },
    });
    console.log(`${role.name}: ${assignedMenus.length} menus assigned`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
