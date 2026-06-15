import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default superadmin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@emergy.my.id' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@emergy.my.id',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
    },
  });

  // Create default roles
  const roles = [
    { name: 'superadmin', description: 'Full system access', permissions: ['*'] },
    { name: 'admin', description: 'System administrator', permissions: ['users:view', 'users:create', 'users:edit', 'incidents:view', 'incidents:create', 'incidents:edit', 'institutions:view', 'institutions:edit', 'dashboard:view'] },
    { name: 'institution_admin', description: 'Institution administrator', permissions: ['incidents:view', 'incidents:create', 'incidents:edit', 'hotlines:manage', 'coverage:manage', 'social:manage', 'dashboard:view'] },
    { name: 'institution_staff', description: 'Institution staff', permissions: ['incidents:view', 'incidents:create', 'hotlines:view', 'social:create'] },
    { name: 'citizen', description: 'Regular citizen', permissions: ['posts:create', 'posts:view', 'comments:create'] },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, permissions: role.permissions },
      create: role,
    });
  }

  // Seed 38 provinces
  const provinces = [
    { id: '11', name: 'Aceh' },
    { id: '12', name: 'Sumatera Utara' },
    { id: '13', name: 'Sumatera Barat' },
    { id: '14', name: 'Riau' },
    { id: '15', name: 'Jambi' },
    { id: '16', name: 'Sumatera Selatan' },
    { id: '17', name: 'Bengkulu' },
    { id: '18', name: 'Lampung' },
    { id: '19', name: 'Kepulauan Bangka Belitung' },
    { id: '21', name: 'Kepulauan Riau' },
    { id: '31', name: 'DKI Jakarta' },
    { id: '32', name: 'Jawa Barat' },
    { id: '33', name: 'Jawa Tengah' },
    { id: '34', name: 'DI Yogyakarta' },
    { id: '35', name: 'Jawa Timur' },
    { id: '36', name: 'Banten' },
    { id: '51', name: 'Bali' },
    { id: '52', name: 'Nusa Tenggara Barat' },
    { id: '53', name: 'Nusa Tenggara Timur' },
    { id: '61', name: 'Kalimantan Barat' },
    { id: '62', name: 'Kalimantan Tengah' },
    { id: '63', name: 'Kalimantan Selatan' },
    { id: '64', name: 'Kalimantan Timur' },
    { id: '65', name: 'Kalimantan Utara' },
    { id: '71', name: 'Sulawesi Utara' },
    { id: '72', name: 'Sulawesi Tengah' },
    { id: '73', name: 'Sulawesi Selatan' },
    { id: '74', name: 'Sulawesi Tenggara' },
    { id: '75', name: 'Gorontalo' },
    { id: '76', name: 'Sulawesi Barat' },
    { id: '81', name: 'Maluku' },
    { id: '82', name: 'Maluku Utara' },
    { id: '91', name: 'Papua' },
    { id: '92', name: 'Papua Barat' },
    { id: '93', name: 'Papua Selatan' },
    { id: '94', name: 'Papua Tengah' },
    { id: '95', name: 'Papua Pegunungan' },
    { id: '96', name: 'Papua Barat Daya' },
  ];

  for (const province of provinces) {
    await prisma.province.upsert({
      where: { id: province.id },
      update: { name: province.name },
      create: province,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
