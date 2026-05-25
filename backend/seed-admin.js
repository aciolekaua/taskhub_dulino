import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@taskhub.com';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log('🌱 Seeding database...');

  // Verifica se o administrador já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    // Garante que é ADMIN se já existir
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Usuário administrador existente atualizado: ${adminEmail}`);
  } else {
    // Cria novo administrador
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador TaskHub',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`🎉 Administrador criado com sucesso!`);
    console.log(`📧 E-mail: ${admin.email}`);
    console.log(`🔑 Senha: ${adminPassword}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Erro no seed:', e);
  process.exit(1);
});
