const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  const users = [
    {
      name: 'Administrador',
      email: 'admin@teste.com',
      password,
      role: 'ADMIN',
    },
    {
      name: 'Bibliotecário',
      email: 'bibliotecario@teste.com',
      password,
      role: 'BIBLIOTECARIO',
    },
    {
      name: 'Aluno Exemplo',
      email: 'aluno@teste.com',
      password,
      role: 'ALUNO',
    },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({ data: u });
      console.log(`Created user: ${u.email} (${u.role})`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
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
