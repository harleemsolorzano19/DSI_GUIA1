import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos existentes...');

  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('Creando tenants...');

  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Tech Solutions Principal',
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Sucursal Secundaria',
    },
  });

  console.log('Creando usuarios...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@techsolutions.com',
      name: 'Admin User',
      password: hashedPassword,
      telephone: '+1-555-0181',
      role: 'ADMIN',
      tenantId: tenant1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@techsolutions.com',
      name: 'John Developer',
      password: hashedPassword,
      telephone: '+1-555-0102',
      role: 'USER',
      tenantId: tenant1.id,
    },
  });

  console.log('¡Seeding finalizado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

